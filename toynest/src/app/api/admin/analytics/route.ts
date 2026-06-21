import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const startOf30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const startOf7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    todayOrders,
    weekOrders,
    monthOrders,
    totalCustomers,
    recentOrders,
    topProducts,
    totalRevenue,
    pendingOrders,
  ] = await Promise.all([
    db.order.aggregate({
      where: { createdAt: { gte: startOfToday }, paymentStatus: "PAID" },
      _sum: { total: true },
      _count: true,
    }),
    db.order.aggregate({
      where: { createdAt: { gte: startOf7Days }, paymentStatus: "PAID" },
      _sum: { total: true },
      _count: true,
    }),
    db.order.aggregate({
      where: { createdAt: { gte: startOf30Days }, paymentStatus: "PAID" },
      _sum: { total: true },
      _count: true,
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1 },
      },
    }),
    db.product.findMany({
      take: 5,
      orderBy: { soldCount: "desc" },
      select: {
        id: true,
        name: true,
        soldCount: true,
        price: true,
        images: true,
      },
    }),
    db.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    db.order.count({ where: { status: "PENDING" } }),
  ]);

  return Response.json({
    today: {
      revenue: todayOrders._sum.total || 0,
      orders: todayOrders._count,
    },
    week: {
      revenue: weekOrders._sum.total || 0,
      orders: weekOrders._count,
    },
    month: {
      revenue: monthOrders._sum.total || 0,
      orders: monthOrders._count,
    },
    totalRevenue: totalRevenue._sum.total || 0,
    totalCustomers,
    pendingOrders,
    recentOrders,
    topProducts,
  });
}
