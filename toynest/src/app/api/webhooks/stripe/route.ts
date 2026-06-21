import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;

    const order = await db.order.findFirst({
      where: { paymentIntentId: pi.id },
      include: { items: true, user: true },
    });

    if (!order) return Response.json({ received: true });

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentMethod: "CARD",
      },
    });

    // Increment sold count
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          soldCount: { increment: item.quantity },
          stock: { decrement: item.quantity },
        },
      });
    }

    const email = order.user?.email || order.guestEmail;
    if (email) {
      await sendOrderConfirmation(
        email,
        order.orderNumber,
        order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        order.total
      );
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    await db.order.updateMany({
      where: { paymentIntentId: pi.id },
      data: { paymentStatus: "FAILED" },
    });
  }

  return Response.json({ received: true });
}
