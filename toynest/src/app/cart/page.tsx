"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, calculateGST } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const shipping = total - discount >= 75 ? 0 : 9.95;
  const discountedTotal = total - discount;
  const gst = calculateGST(discountedTotal + shipping);
  const finalTotal = discountedTotal + shipping + gst;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: total }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Invalid coupon", description: data.error, variant: "destructive" as never });
      } else {
        setDiscount(data.discount);
        setAppliedCoupon(couponCode.toUpperCase());
        toast({ title: "Coupon applied!", description: `You saved ${formatPrice(data.discount)}`, variant: "success" as never });
      }
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 text-center">
            Time to fill it with some awesome toys!
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/products">
              <ShoppingBag className="h-5 w-5" /> Start Shopping
            </Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 flex-1">
        <h1 className="text-3xl font-black text-gray-900 mb-8">
          Your Cart ({items.length} item{items.length !== 1 ? "s" : ""})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4"
              >
                <Link href={`/product/${item.slug}`}>
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🧸</div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-bold text-gray-900 hover:text-orange-500 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-orange-500 font-black text-lg mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.productId, item.quantity - 1)
                          : removeItem(item.productId)
                      }
                      className="px-2 py-1.5 hover:bg-gray-50 text-gray-700 font-bold"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1.5 font-bold text-sm min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1.5 hover:bg-gray-50 text-gray-700 font-bold"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-gray-700">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sticky top-20">
              <h2 className="text-xl font-black text-gray-900 mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 text-green-700">
                      <Tag className="h-4 w-4" />
                      <span className="font-bold text-sm">{appliedCoupon}</span>
                    </div>
                    <button
                      onClick={() => { setAppliedCoupon(""); setDiscount(0); setCouponCode(""); }}
                      className="text-xs text-red-500 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyCoupon}
                      loading={couponLoading}
                      className="shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {/* Line items */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (10%)</span>
                  <span className="font-semibold">{formatPrice(gst)}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-1.5">
                    🎉 You qualify for free shipping!
                  </p>
                )}
                {shipping > 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-1.5">
                    Add {formatPrice(75 - (total - discount))} more for free shipping
                  </p>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-orange-500">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full mt-5 gap-2">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Secure checkout · SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
