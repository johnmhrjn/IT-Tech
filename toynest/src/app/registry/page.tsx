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
import { formatPrice, formatDate } from "@/lib/utils";
import { Gift, Plus, Share2, ExternalLink } from "lucide-react";

export default async function RegistryPage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callbackUrl=/registry");

  const registries = await db.giftRegistry.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, images: true, price: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Gift className="h-8 w-8 text-orange-500" />
              Gift Registries
            </h1>
            <p className="text-gray-500 mt-1">Share your wish lists with family and friends</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/registry/new">
              <Plus className="h-4 w-4" /> New Registry
            </Link>
          </Button>
        </div>

        {registries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-7xl mb-6">🎀</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No registries yet</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Create a gift registry for a birthday, baby shower, or any special occasion and share it with loved ones.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/registry/new">
                <Plus className="h-5 w-5" /> Create Your First Registry
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {registries.map((registry) => {
              const totalItems = registry.items.length;
              const purchasedItems = registry.items.filter((i) => i.purchased >= i.quantity).length;
              const progress = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

              return (
                <div
                  key={registry.id}
                  className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
                >
                  <div className="flex items-start justify-between p-6 pb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-black text-gray-900">{registry.name}</h2>
                        {registry.isPublic ? (
                          <Badge variant="success" className="text-xs">Public</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Private</Badge>
                        )}
                      </div>
                      {registry.occasion && (
                        <p className="text-sm text-orange-500 font-semibold">{registry.occasion}</p>
                      )}
                      {registry.eventDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Event date: {formatDate(registry.eventDate)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <Link href={`/registry/${registry.shareCode}`} target="_blank">
                          <ExternalLink className="h-3 w-3" /> View
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          // handled client side
                        }}
                      >
                        <Share2 className="h-3 w-3" /> Share
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-600 font-semibold">{purchasedItems} of {totalItems} items received</span>
                      <span className="text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Items preview */}
                  {registry.items.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="flex gap-2 flex-wrap">
                        {registry.items.slice(0, 6).map((item) => (
                          <div key={item.id} className="relative">
                            <div className="h-14 w-14 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                              {item.product.images[0] ? (
                                <Image
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  width={56}
                                  height={56}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xl">🧸</div>
                              )}
                            </div>
                            {item.purchased >= item.quantity && (
                              <div className="absolute inset-0 bg-green-500/70 rounded-xl flex items-center justify-center">
                                <span className="text-white text-lg font-bold">✓</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {registry.items.length > 6 && (
                          <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                            +{registry.items.length - 6}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {registry.items.length === 0 && (
                    <div className="px-6 pb-6 text-center">
                      <p className="text-gray-400 text-sm mb-3">No items added yet</p>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/products">Browse Products</Link>
                      </Button>
                    </div>
                  )}

                  <div className="border-t border-gray-50 px-6 py-3 flex items-center justify-between bg-gray-50/50">
                    <p className="text-xs text-gray-400">Created {formatDate(registry.createdAt)}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400 font-mono">
                        Code: <span className="font-semibold text-gray-600">{registry.shareCode}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
