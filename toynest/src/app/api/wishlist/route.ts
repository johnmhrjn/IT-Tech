import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    return Response.json({ wishlisted: false });
  }

  await db.wishlistItem.create({
    data: { userId: session.user.id, productId },
  });

  return Response.json({ wishlisted: true });
}
