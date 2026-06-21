export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Package, Heart, MapPin, Gift } from "lucide-react";

const STATUS_COLORS: Record<string, "default" | "secondary" | "success" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callbackUrl=/account");

  const [orders, wishlistCount, addressCount, registries] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      include: { items: { take: 1, select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.wishlistItem.count({ where: { userId: session.user.id } }),
    db.address.count({ where: { userId: session.user.id } }),
    db.giftRegistry.count({ where: { userId: session.user.id } }),
  ]);

  const quickLinks = [
    { label: "Orders", icon: Package, href: "/account/orders", count: orders.length, color: "bg-blue-100 text-blue-600" },
    { label: "Wishlist", icon: Heart, href: "/wishlist", count: wishlistCount, color: "bg-pink-100 text-pink-600" },
    { label: "Addresses", icon: MapPin, href: "/account/addresses", count: addressCount, color: "bg-purple-100 text-purple-600" },
    { label: "Gift Registries", icon: Gift, href: "/registry", count: registries, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 flex-1">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt={session.user.name || ""} className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <User className="h-8 w-8 text-orange-500" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{session.user.name || "My Account"}</h1>
            <p className="text-gray-500">{session.user.email}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickLinks.map(({ label, icon: Icon, href, count, color }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-5 hover:border-orange-200 transition-colors"
            >
              <div className={`p-3 rounded-2xl ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-bold text-gray-900 text-sm">{label}</span>
              <span className="text-2xl font-black text-gray-900">{count}</span>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-900">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm text-orange-500 font-semibold hover:underline">
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-gray-500 font-semibold mb-4">No orders yet</p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900 font-mono">{order.orderNumber}</span>
                      <Badge variant={STATUS_COLORS[order.status] || "outline"} className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {order.items[0]?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-orange-500">{formatPrice(order.total)}</div>
                    <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                  </div>
                  <Link
                    href={`/track?order=${order.orderNumber}`}
                    className="text-xs text-orange-500 font-semibold hover:underline shrink-0"
                  >
                    Track
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Settings Link */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="font-black text-gray-900 mb-4">Account Settings</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="font-semibold text-sm text-gray-900">Name</p>
                <p className="text-sm text-gray-500">{session.user.name || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="font-semibold text-sm text-gray-900">Email</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">Password</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
              <Link href="/account/password" className="text-sm text-orange-500 font-semibold hover:underline">
                Change
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
