import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { generateOrderNumber, calculateGST } from "@/lib/utils";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  shipping: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postcode: z.string(),
  }),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Invalid checkout data" }, { status: 400 });
    }

    const { items, shipping, couponCode, notes } = parsed.data;

    // Fetch products
    const products = await db.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, isActive: true },
    });

    if (products.length !== items.length) {
      return Response.json({ error: "Some items are unavailable" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const total = product.price * item.quantity;
      subtotal += total;
      return { product, quantity: item.quantity, total };
    });

    // Apply coupon
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await db.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      });

      if (coupon) {
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          return Response.json(
            { error: `Minimum order of $${coupon.minOrder} required for this coupon` },
            { status: 400 }
          );
        }
        if (coupon.type === "PERCENTAGE") discount = subtotal * (coupon.value / 100);
        else if (coupon.type === "FLAT") discount = Math.min(coupon.value, subtotal);
      }
    }

    const discountedSubtotal = subtotal - discount;
    const shippingCost = discountedSubtotal >= 75 ? 0 : 9.95; // Free shipping over $75
    const gst = calculateGST(discountedSubtotal + shippingCost);
    const total = discountedSubtotal + shippingCost + gst;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "aud",
      automatic_payment_methods: { enabled: true },
      metadata: {
        couponCode: couponCode || "",
        userEmail: shipping.email,
      },
    });

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session?.user.id,
        guestEmail: !session ? shipping.email : undefined,
        guestName: !session ? `${shipping.firstName} ${shipping.lastName}` : undefined,
        guestPhone: !session ? shipping.phone : undefined,
        shippingLine1: shipping.line1,
        shippingLine2: shipping.line2,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPostcode: shipping.postcode,
        subtotal,
        discount,
        shipping: shippingCost,
        gst,
        total,
        couponCode: couponCode?.toUpperCase(),
        notes,
        paymentIntentId: paymentIntent.id,
        items: {
          create: lineItems.map(({ product, quantity, total: itemTotal }) => ({
            productId: product.id,
            name: product.name,
            image: product.images[0],
            price: product.price,
            quantity,
            total: itemTotal,
          })),
        },
      },
    });

    if (coupon) {
      await db.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}
