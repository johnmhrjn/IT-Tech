import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const ageMin = searchParams.get("ageMin");
  const ageMax = searchParams.get("ageMax");
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const rating = searchParams.get("rating");
  const featured = searchParams.get("featured");
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(48, parseInt(searchParams.get("limit") || "12"));

  const where: Record<string, unknown> = { isActive: true };

  if (category) where.category = { slug: category };
  if (featured === "true") where.isFeatured = true;
  if (ageMin) where.ageMax = { gte: parseInt(ageMin) };
  if (ageMax) where.ageMin = { lte: parseInt(ageMax) };
  if (priceMin || priceMax) {
    where.price = {};
    if (priceMin) (where.price as Record<string, number>).gte = parseFloat(priceMin);
    if (priceMax) (where.price as Record<string, number>).lte = parseFloat(priceMax);
  }
  if (rating) where.avgRating = { gte: parseFloat(rating) };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ];
  }

  const orderBy: Record<string, unknown> =
    sort === "price_asc" ? { price: "asc" }
    : sort === "price_desc" ? { price: "desc" }
    : sort === "rating" ? { avgRating: "desc" }
    : sort === "popular" ? { soldCount: "desc" }
    : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return Response.json({
    products,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
