import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  // Related products
  const related = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: { category: true },
    take: 4,
    orderBy: { soldCount: "desc" },
  });

  return Response.json({ product, related });
}
