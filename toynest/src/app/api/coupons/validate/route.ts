import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();

  if (!code) return Response.json({ error: "Code required" }, { status: 400 });

  const coupon = await db.coupon.findFirst({
    where: {
      code: code.toUpperCase(),
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
    },
  });

  if (!coupon) {
    return Response.json({ error: "Invalid or expired coupon code" }, { status: 404 });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return Response.json({ error: "This coupon has expired" }, { status: 400 });
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return Response.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return Response.json(
      { error: `Minimum order of $${coupon.minOrder} required` },
      { status: 400 }
    );
  }

  let discount = 0;
  if (coupon.type === "PERCENTAGE") discount = subtotal * (coupon.value / 100);
  else if (coupon.type === "FLAT") discount = Math.min(coupon.value, subtotal);
  else if (coupon.type === "FREE_SHIPPING") discount = 9.95;

  return Response.json({ coupon, discount });
}
