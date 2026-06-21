import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendShippingUpdate } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.trackingNumber) data.trackingNumber = body.trackingNumber;
  if (body.trackingUrl) data.trackingUrl = body.trackingUrl;
  if (body.supplierOrderId) data.supplierOrderId = body.supplierOrderId;

  if (body.status === "SHIPPED") {
    data.shippedAt = new Date();
  }
  if (body.status === "DELIVERED") {
    data.deliveredAt = new Date();
  }

  const order = await db.order.update({
    where: { id },
    data,
    include: { user: true, items: true },
  });

  if (body.status === "SHIPPED" && body.trackingNumber) {
    const email = order.user?.email || order.guestEmail;
    if (email) {
      await sendShippingUpdate(
        email,
        order.orderNumber,
        body.trackingNumber,
        body.trackingUrl
      );
    }
  }

  return Response.json({ order });
}
