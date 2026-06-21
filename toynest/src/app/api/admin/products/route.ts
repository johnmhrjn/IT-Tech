import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const q = searchParams.get("q");
  const limit = 20;

  const where = q
    ? { name: { contains: q, mode: "insensitive" as const } }
    : {};

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return Response.json({ products, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);

  const product = await db.product.create({
    data: {
      ...parsed.data,
      slug,
      images: body.images || [],
    },
  });

  return Response.json({ product }, { status: 201 });
}
