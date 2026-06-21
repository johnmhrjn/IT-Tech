export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getAgeLabel } from "@/lib/utils";
import { Heart, ShoppingCart } from "lucide-react";

export default async function WishlistPage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callbackUrl=/wishlist");

  const wishlist = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              My Wishlist
            </h1>
            <p className="text-gray-500 mt-1">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-20 w-20 text-gray-200 mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save your favourite toys so you never lose track of them.</p>
            <Button asChild size="lg">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map(({ product, id }) => (
              <div
                key={id}
                className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-orange-200 transition-colors group"
              >
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">🧸</div>
                    )}
                    {!product.isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Unavailable</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <p className="text-xs text-orange-500 font-semibold mb-1">{product.category.name}</p>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 hover:text-orange-500 transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-black text-orange-500">{formatPrice(product.price)}</span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <Badge variant="outline" className="text-xs mb-3">
                    {getAgeLabel(product.ageMin, product.ageMax)}
                  </Badge>

                  <div className="flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 gap-1"
                      disabled={!product.isActive || product.stock === 0}
                    >
                      <Link href={`/product/${product.slug}`}>
                        <ShoppingCart className="h-3 w-3" />
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Link>
                    </Button>
                    <form action="/api/wishlist" method="POST">
                      <input type="hidden" name="productId" value={product.id} />
                      <button
                        type="submit"
                        className="h-8 w-8 flex items-center justify-center rounded-lg border-2 border-pink-200 text-pink-500 hover:bg-pink-50 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Heart className="h-4 w-4 fill-pink-500" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
