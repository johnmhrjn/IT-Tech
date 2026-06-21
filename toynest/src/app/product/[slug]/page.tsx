"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart, Heart, Shield, Star, Package, Truck,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/products/star-rating";
import { ProductCard } from "@/components/products/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getAgeLabel } from "@/lib/utils";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch on mount
  use(
    (async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) {
        setError("Product not found");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProduct(data.product);
      setRelated(data.related || []);
      setLoading(false);
    })()
  );

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center min-h-96">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center min-h-96 gap-4">
          <div className="text-5xl">🧸</div>
          <h1 className="text-2xl font-black text-gray-900">Product not found</h1>
          <Button asChild variant="outline">
            <Link href="/products">Back to shop</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
      },
      quantity
    );
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-orange-500">Toys</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-orange-500">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-48">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
              {product.images[activeImage] ? (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl">🧸</div>
              )}
              {discount && (
                <Badge variant="destructive" className="absolute top-4 left-4 text-sm">
                  -{discount}% OFF
                </Badge>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => Math.max(0, p - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/80 hover:bg-white shadow"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => Math.min(product.images.length - 1, p + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/80 hover:bg-white shadow"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${activeImage === i ? "border-orange-500" : "border-gray-200"}`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="age">{getAgeLabel(product.ageMin, product.ageMax)}</Badge>
              {product.safetyBadges.map((badge: string) => (
                <Badge key={badge} variant="safety" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> {badge}
                </Badge>
              ))}
              <Badge variant="secondary">{product.category.name}</Badge>
            </div>

            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={product.avgRating} size="md" />
                <span className="text-sm text-gray-600 font-semibold">
                  {product.avgRating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-orange-500">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
              {discount && (
                <Badge variant="destructive" className="text-sm">Save {discount}%</Badge>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-50 font-bold text-gray-700"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold min-w-[2.5rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="px-3 py-2 hover:bg-gray-50 font-bold text-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock */}
            <div className="text-sm font-semibold">
              {product.stock === 0 ? (
                <span className="text-red-500">Out of stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-orange-500">Only {product.stock} left!</span>
              ) : (
                <span className="text-green-600">In stock — ready to ship</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline" className="px-4">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust signals */}
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-500" />
                Free delivery over $75
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                30-day returns
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                Safety certified
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Verified reviews
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-gray-100 p-6 mb-12">
          <h2 className="text-xl font-black text-gray-900 mb-3">About this toy</h2>
          <div className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</div>
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-gray-900 mb-6">
            Customer Reviews ({product.reviews?.length || 0})
          </h2>
          {product.reviews?.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.reviews?.map((review: any) => (
                <div key={review.id} className="rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={review.rating} size="sm" />
                        {review.isVerified && (
                          <Badge variant="success" className="text-xs">Verified Purchase</Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-bold text-gray-900">{review.title}</h4>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(review.createdAt).toLocaleDateString("en-AU")}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{review.body}</p>
                  <p className="text-xs text-gray-400 mt-2">— {review.user.name || "Verified Buyer"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
