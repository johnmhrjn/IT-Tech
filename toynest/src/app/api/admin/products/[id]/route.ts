import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  return session?.user.role === "ADMIN" ? session : null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = productSchema.partial().safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (body.images) data.images = body.images;
  if (parsed.data.name) data.slug = slugify(parsed.data.name);

  const product = await db.product.update({ where: { id }, data });
  return Response.json({ product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await db.product.update({
    where: { id },
    data: { isActive: false },
  });

  return Response.json({ success: true });
}
