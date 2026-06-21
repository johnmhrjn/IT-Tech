"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getAgeLabel } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import type { ProductWithCategory } from "@/types";

interface ProductCardProps {
  product: ProductWithCategory;
  onWishlist?: (productId: string) => void;
  inWishlist?: boolean;
}

export function ProductCard({ product, onWishlist, inWishlist }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      slug: product.slug,
    });
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden bg-gray-50 aspect-square">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🧸</div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <Badge variant="destructive" className="text-xs px-2 py-0.5">
              -{discount}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="text-xs px-2 py-0.5">Best Seller</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlist?.(product.id);
          }}
          className="absolute top-2 right-2 p-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Age & safety */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="age" className="text-xs py-0.5">
            {getAgeLabel(product.ageMin, product.ageMax)}
          </Badge>
          {product.safetyBadges.slice(0, 1).map((badge) => (
            <Badge key={badge} variant="safety" className="text-xs py-0.5 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {badge}
            </Badge>
          ))}
        </div>

        {/* Category */}
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {product.category.name}
        </span>

        {/* Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-bold text-gray-900 leading-snug hover:text-orange-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(product.avgRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-lg font-black text-orange-500">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <Button
          size="sm"
          className="w-full mt-1 gap-2"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
