import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderNumber = searchParams.get("orderNumber");
  const email = searchParams.get("email");

  if (!orderNumber || !email) {
    return Response.json({ error: "Order number and email required" }, { status: 400 });
  }

  const order = await db.order.findFirst({
    where: {
      orderNumber,
      OR: [
        { guestEmail: email },
        { user: { email } },
      ],
    },
    include: {
      items: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json({ order });
}
