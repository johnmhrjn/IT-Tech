export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/db";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { ProductWithCategory } from "@/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const AGE_FILTERS = [
  { label: "0–2 yrs", min: 0, max: 2 },
  { label: "3–5 yrs", min: 3, max: 5 },
  { label: "6–8 yrs", min: 6, max: 8 },
  { label: "9–12 yrs", min: 9, max: 12 },
];

interface PageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    ageMin?: string;
    ageMax?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
    page?: string;
    featured?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 12;

  const where: Record<string, unknown> = { isActive: true };
  if (sp.category) where.category = { slug: sp.category };
  if (sp.featured === "true") where.isFeatured = true;
  if (sp.ageMin) where.ageMax = { gte: parseInt(sp.ageMin) };
  if (sp.ageMax) where.ageMin = { lte: parseInt(sp.ageMax) };
  if (sp.priceMin || sp.priceMax) {
    where.price = {};
    if (sp.priceMin) (where.price as Record<string, number>).gte = parseFloat(sp.priceMin);
    if (sp.priceMax) (where.price as Record<string, number>).lte = parseFloat(sp.priceMax);
  }
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const sort = sp.sort || "newest";
  const orderBy: Record<string, unknown> =
    sort === "price_asc" ? { price: "asc" }
    : sort === "price_desc" ? { price: "desc" }
    : sort === "rating" ? { avgRating: "desc" }
    : sort === "popular" ? { soldCount: "desc" }
    : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, v);
    });
    return `/products?${params.toString()}`;
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900">
            {sp.q ? `Results for "${sp.q}"` : sp.featured === "true" ? "Best Sellers" : "All Toys"}
          </h1>
          <p className="text-gray-500 mt-1">{total} products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-6 sticky top-20">
              <div>
                <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </h3>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-sm text-gray-700 mb-2">Category</h4>
                <div className="space-y-1">
                  <Link
                    href={buildUrl({ category: undefined, page: "1" })}
                    className={`block text-sm px-3 py-1.5 rounded-xl transition-colors ${!sp.category ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={buildUrl({ category: cat.slug, page: "1" })}
                      className={`block text-sm px-3 py-1.5 rounded-xl transition-colors ${sp.category === cat.slug ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <h4 className="font-bold text-sm text-gray-700 mb-2">Age Group</h4>
                <div className="flex flex-wrap gap-2">
                  {AGE_FILTERS.map((age) => {
                    const active = sp.ageMin === String(age.min) && sp.ageMax === String(age.max);
                    return (
                      <Link
                        key={age.label}
                        href={buildUrl({
                          ageMin: active ? undefined : String(age.min),
                          ageMax: active ? undefined : String(age.max),
                          page: "1",
                        })}
                      >
                        <Badge variant={active ? "default" : "outline"} className="cursor-pointer">
                          {age.label}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="font-bold text-sm text-gray-700 mb-2">Price Range</h4>
                <div className="space-y-1">
                  {[
                    { label: "Under $25", max: "25" },
                    { label: "$25 – $50", min: "25", max: "50" },
                    { label: "$50 – $100", min: "50", max: "100" },
                    { label: "Over $100", min: "100" },
                  ].map(({ label, min, max }) => (
                    <Link
                      key={label}
                      href={buildUrl({ priceMin: min, priceMax: max, page: "1" })}
                      className={`block text-sm px-3 py-1.5 rounded-xl transition-colors ${sp.priceMin === min && sp.priceMax === max ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {(sp.category || sp.ageMin || sp.priceMin || sp.q) && (
                <Button asChild variant="ghost" size="sm" className="w-full text-red-500 hover:bg-red-50">
                  <Link href="/products">Clear all filters</Link>
                </Button>
              )}
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Sort */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                {SORT_OPTIONS.map((opt) => (
                  <Link key={opt.value} href={buildUrl({ sort: opt.value, page: "1" })}>
                    <Badge
                      variant={sort === opt.value ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                    >
                      {opt.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                <Button asChild variant="outline">
                  <Link href="/products">Clear filters</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as ProductWithCategory} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={page <= 1 ? "pointer-events-none opacity-40" : ""}
                >
                  <Link href={buildUrl({ page: String(page - 1) })}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <Button
                      key={p}
                      asChild
                      variant={page === p ? "default" : "outline"}
                      size="sm"
                    >
                      <Link href={buildUrl({ page: String(p) })}>{p}</Link>
                    </Button>
                  );
                })}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
                >
                  <Link href={buildUrl({ page: String(page + 1) })}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
