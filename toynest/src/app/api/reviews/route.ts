import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Sign in to leave a review" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { rating, title, body: reviewBody } = parsed.data;
  const { productId } = body;

  if (!productId) {
    return Response.json({ error: "Product ID required" }, { status: 400 });
  }

  // Check verified purchase
  const order = await db.order.findFirst({
    where: {
      userId: session.user.id,
      paymentStatus: "PAID",
      items: { some: { productId } },
    },
  });

  const existing = await db.review.findUnique({
    where: { productId_userId: { productId, userId: session.user.id } },
  });

  if (existing) {
    return Response.json({ error: "You have already reviewed this product" }, { status: 409 });
  }

  const review = await db.review.create({
    data: {
      productId,
      userId: session.user.id,
      rating,
      title,
      body: reviewBody,
      isVerified: !!order,
    },
  });

  return Response.json({ review }, { status: 201 });
}
