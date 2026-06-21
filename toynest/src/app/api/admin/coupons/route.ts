import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { couponSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  return session?.user.role === "ADMIN" ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ coupons });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = couponSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const coupon = await db.coupon.create({
    data: {
      ...parsed.data,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  });

  return Response.json({ coupon }, { status: 201 });
}
