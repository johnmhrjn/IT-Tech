export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 20;

  const where = sp.q
    ? { name: { contains: sp.q, mode: "insensitive" as const } }
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Products ({total})</h1>
        <Button asChild className="gap-2">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/products">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search products..."
          className="w-full max-w-sm rounded-xl border-2 border-gray-200 px-4 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Product</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Category</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Price</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Stock</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Sold</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg">🧸</div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 max-w-[200px] truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-400">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{product.category.name}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-semibold ${
                        product.stock === 0
                          ? "text-red-500"
                          : product.stock <= 5
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{product.soldCount}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={product.isActive ? "success" : "outline"} className="text-xs">
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {product.isFeatured && (
                      <Badge className="text-xs ml-1">Featured</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-xs text-orange-500 font-semibold hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">No products found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={page <= 1 ? "pointer-events-none opacity-40" : ""}
          >
            <Link href={`/admin/products?page=${page - 1}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-600 font-semibold">
            Page {page} of {totalPages}
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
          >
            <Link href={`/admin/products?page=${page + 1}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
