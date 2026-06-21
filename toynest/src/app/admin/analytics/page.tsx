export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, ShoppingBag, Star, Package } from "lucide-react";
import { RevenueChart } from "./revenue-chart";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const start30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const start90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Build daily revenue for last 30 days
  const recentOrders = await db.order.findMany({
    where: { createdAt: { gte: start30 }, paymentStatus: "PAID" },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().substring(0, 10);
    dailyMap[key] = 0;
  }
  recentOrders.forEach((o) => {
    const key = o.createdAt.toISOString().substring(0, 10);
    if (key in dailyMap) dailyMap[key] += o.total;
  });
  const chartData = Object.entries(dailyMap).map(([date, revenue]) => ({
    date: date.substring(5), // MM-DD
    revenue: Math.round(revenue * 100) / 100,
  }));

  const [
    totalRevenue,
    monthRevenue,
    totalOrders,
    monthOrders,
    totalCustomers,
    newCustomers,
    avgRating,
    topProducts,
    categoryStats,
    statusBreakdown,
  ] = await Promise.all([
    db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    db.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: start30 } }, _sum: { total: true }, _count: true }),
    db.order.count({ where: { paymentStatus: "PAID" } }),
    db.order.count({ where: { paymentStatus: "PAID", createdAt: { gte: start30 } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: start30 } } }),
    db.review.aggregate({ where: { isApproved: true }, _avg: { rating: true }, _count: true }),
    db.product.findMany({
      take: 10,
      orderBy: { soldCount: "desc" },
      select: { id: true, name: true, soldCount: true, price: true, images: true },
    }),
    db.category.findMany({
      include: {
        _count: { select: { products: true } },
        products: {
          select: { soldCount: true },
          where: { isActive: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    db.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue._sum.total || 0),
      sub: `${formatPrice(monthRevenue._sum.total || 0)} this month`,
      icon: TrendingUp,
      color: "text-green-500 bg-green-100",
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      sub: `${monthOrders} this month`,
      icon: ShoppingBag,
      color: "text-blue-500 bg-blue-100",
    },
    {
      title: "Customers",
      value: totalCustomers.toLocaleString(),
      sub: `+${newCustomers} this month`,
      icon: Users,
      color: "text-purple-500 bg-purple-100",
    },
    {
      title: "Avg Rating",
      value: avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) + " ★" : "N/A",
      sub: `${avgRating._count} reviews`,
      icon: Star,
      color: "text-yellow-500 bg-yellow-100",
    },
  ];

  const avgOrderValue = monthOrders > 0 ? (monthRevenue._sum.total || 0) / monthOrders : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Last 30 days overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, sub, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">{title}</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              <CardTitle>Top Selling Products</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-6 py-3.5">
                  <div className="h-7 w-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.soldCount} sold · {formatPrice(p.price)}</p>
                  </div>
                  <span className="text-sm font-black text-orange-500">
                    {formatPrice(p.price * p.soldCount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category & Order Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {statusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm font-semibold text-gray-700">{s.status}</span>
                    <span className="text-sm font-black text-gray-900">{s._count.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {categoryStats.map((cat) => {
                  const totalSold = cat.products.reduce((sum, p) => sum + p.soldCount, 0);
                  return (
                    <div key={cat.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat._count.products} products</p>
                      </div>
                      <span className="text-sm font-black text-gray-900">{totalSold} sold</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary boxes */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-orange-500 text-white p-5">
          <p className="text-sm font-semibold opacity-90">Avg Order Value</p>
          <p className="text-3xl font-black mt-1">{formatPrice(avgOrderValue)}</p>
          <p className="text-sm opacity-75 mt-1">This month</p>
        </div>
        <div className="rounded-2xl bg-blue-500 text-white p-5">
          <p className="text-sm font-semibold opacity-90">Conversion Rate</p>
          <p className="text-3xl font-black mt-1">—</p>
          <p className="text-sm opacity-75 mt-1">Connect analytics</p>
        </div>
        <div className="rounded-2xl bg-purple-500 text-white p-5">
          <p className="text-sm font-semibold opacity-90">Return Rate</p>
          <p className="text-3xl font-black mt-1">—</p>
          <p className="text-sm opacity-75 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
