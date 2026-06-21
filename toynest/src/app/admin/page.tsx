export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Users, Clock, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminDashboard() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const start7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [today, week, month, totalRevenue, totalCustomers, pendingOrders, recentOrders, topProducts] =
    await Promise.all([
      db.order.aggregate({
        where: { createdAt: { gte: startOfToday }, paymentStatus: "PAID" },
        _sum: { total: true },
        _count: true,
      }),
      db.order.aggregate({
        where: { createdAt: { gte: start7 }, paymentStatus: "PAID" },
        _sum: { total: true },
        _count: true,
      }),
      db.order.aggregate({
        where: { createdAt: { gte: start30 }, paymentStatus: "PAID" },
        _sum: { total: true },
        _count: true,
      }),
      db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { take: 1, select: { name: true } },
        },
      }),
      db.product.findMany({
        take: 5,
        orderBy: { soldCount: "desc" },
        select: { id: true, name: true, soldCount: true, price: true },
      }),
    ]);

  const stats = [
    {
      title: "Today's Revenue",
      value: formatPrice(today._sum.total || 0),
      sub: `${today._count} orders today`,
      icon: TrendingUp,
      color: "text-green-500 bg-green-100",
    },
    {
      title: "This Month",
      value: formatPrice(month._sum.total || 0),
      sub: `${month._count} orders`,
      icon: ShoppingBag,
      color: "text-blue-500 bg-blue-100",
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      sub: "Registered accounts",
      icon: Users,
      color: "text-purple-500 bg-purple-100",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      sub: "Awaiting action",
      icon: Clock,
      color: "text-orange-500 bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome back! Here&apos;s what&apos;s happening at ToyNest.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ title, value, sub, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">{title}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
                <div className={`p-3 rounded-2xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/orders" className="text-sm text-orange-500 font-semibold hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{order.orderNumber}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {order.user?.email || order.guestEmail} · {order.items[0]?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-orange-500">{formatPrice(order.total)}</div>
                    <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Products</CardTitle>
              <Link href="/admin/products" className="text-sm text-orange-500 font-semibold hover:underline">
                All products
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-6 py-3.5">
                  <div className="h-7 w-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.soldCount} sold · {formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-orange-500 text-white p-5">
          <p className="text-sm font-semibold opacity-90">Total Revenue</p>
          <p className="text-3xl font-black mt-1">{formatPrice(totalRevenue._sum.total || 0)}</p>
          <p className="text-sm opacity-75 mt-1">All time</p>
        </div>
        <div className="rounded-2xl bg-blue-500 text-white p-5">
          <p className="text-sm font-semibold opacity-90">This Week</p>
          <p className="text-3xl font-black mt-1">{formatPrice(week._sum.total || 0)}</p>
          <p className="text-sm opacity-75 mt-1">{week._count} orders</p>
        </div>
        <div className="rounded-2xl bg-purple-500 text-white p-5">
          <p className="text-sm font-semibold opacity-90">Avg Order Value</p>
          <p className="text-3xl font-black mt-1">
            {formatPrice(month._count > 0 ? (month._sum.total || 0) / month._count : 0)}
          </p>
          <p className="text-sm opacity-75 mt-1">Last 30 days</p>
        </div>
      </div>
    </div>
  );
}
