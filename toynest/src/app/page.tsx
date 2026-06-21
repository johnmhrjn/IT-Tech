export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowRight, Shield, Truck, RefreshCw, Star } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithCategory } from "@/types";

const CATEGORIES = [
  {
    slug: "educational-stem",
    name: "STEM & Educational",
    emoji: "🔬",
    color: "from-blue-400 to-cyan-400",
    description: "Build bright minds",
  },
  {
    slug: "action-figures-dolls",
    name: "Dolls & Figures",
    emoji: "🪆",
    color: "from-pink-400 to-rose-400",
    description: "Imaginative play",
  },
  {
    slug: "outdoor-sports",
    name: "Outdoor & Sports",
    emoji: "⚽",
    color: "from-green-400 to-emerald-400",
    description: "Active adventures",
  },
  {
    slug: "arts-crafts",
    name: "Arts & Crafts",
    emoji: "🎨",
    color: "from-orange-400 to-yellow-400",
    description: "Spark creativity",
  },
];

const AGE_GROUPS = [
  { label: "0–2 years", emoji: "🍼", href: "/products?ageMin=0&ageMax=2", color: "bg-purple-100 text-purple-700" },
  { label: "3–5 years", emoji: "🎠", href: "/products?ageMin=3&ageMax=5", color: "bg-sky-100 text-sky-700" },
  { label: "6–8 years", emoji: "🚀", href: "/products?ageMin=6&ageMax=8", color: "bg-orange-100 text-orange-700" },
  { label: "9–12 years", emoji: "🎮", href: "/products?ageMin=9&ageMax=12", color: "bg-green-100 text-green-700" },
];

export default async function HomePage() {
  const featuredProducts = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    take: 8,
    orderBy: { soldCount: "desc" },
  });

  const newArrivals = await db.product.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
          <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 text-sm px-4 py-1.5">🇦🇺 Free shipping over $75</Badge>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-4">
                  Where Play
                  <br />
                  <span className="text-orange-500">Meets Magic</span> ✨
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Discover hundreds of safe, fun, age-appropriate toys for little ones across Australia.
                  Every toy is carefully chosen for quality and safety.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/products">
                      Shop All Toys <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/products?featured=true">Best Sellers</Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-6 text-white hover:scale-105 transition-transform duration-200 shadow-md`}
                  >
                    <div className="text-4xl mb-2">{cat.emoji}</div>
                    <div className="font-black text-lg leading-tight">{cat.name}</div>
                    <div className="text-sm opacity-90 mt-1">{cat.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-200 opacity-30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-yellow-200 opacity-30 blur-3xl" />
        </section>

        {/* Age Groups */}
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Shop by Age</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AGE_GROUPS.map((group) => (
              <Link
                key={group.label}
                href={group.href}
                className={`flex items-center gap-3 rounded-2xl px-5 py-4 font-bold text-base hover:scale-105 transition-transform ${group.color}`}
              >
                <span className="text-2xl">{group.emoji}</span>
                {group.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        {featuredProducts.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Best Sellers ⭐</h2>
                <p className="text-gray-500 text-sm mt-1">Loved by Australian families</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/products?featured=true">View all</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product as ProductWithCategory} />
              ))}
            </div>
          </section>
        )}

        {/* Trust banner */}
        <section className="bg-orange-500 text-white py-10 my-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: Shield, title: "Safety Certified", desc: "All toys meet AU/NZ safety standards" },
                { icon: Truck, title: "Free Delivery", desc: "On orders over $75 Australia-wide" },
                { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free returns" },
                { icon: Star, title: "Top Rated", desc: "4.8★ from 10,000+ happy families" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="font-bold">{title}</div>
                  <div className="text-sm opacity-90">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">New Arrivals 🎁</h2>
                <p className="text-gray-500 text-sm mt-1">Fresh in store</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/products?sort=newest">See all new</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product as ProductWithCategory} />
              ))}
            </div>
          </section>
        )}

        {/* Gift Registry CTA */}
        <section className="mx-auto max-w-7xl px-4 py-8 mb-8">
          <div className="rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black mb-2">Create a Gift Registry 🎀</h2>
              <p className="text-white/90 text-lg">
                Planning a birthday? Let family and friends know exactly what your little one wants.
              </p>
            </div>
            <Button
              asChild
              size="xl"
              className="bg-white text-purple-600 hover:bg-purple-50 shrink-0 font-black"
            >
              <Link href="/registry">Start Registry</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
