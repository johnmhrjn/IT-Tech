export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, "default" | "secondary" | "success" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.q) {
    where.OR = [
      { orderNumber: { contains: sp.q, mode: "insensitive" } },
      { guestEmail: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1, select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Orders ({total})</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/orders">
          <Badge variant={!sp.status ? "default" : "outline"} className="cursor-pointer">All</Badge>
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`}>
            <Badge variant={sp.status === s ? "default" : "outline"} className="cursor-pointer">
              {s}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Order</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Customer</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Item</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Status</th>
                <th className="text-right px-5 py-3 font-bold text-gray-700">Total</th>
                <th className="text-right px-5 py-3 font-bold text-gray-700">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-gray-900">{order.user?.name || order.guestName}</div>
                    <div className="text-xs text-gray-400">{order.user?.email || order.guestEmail}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-[160px] truncate">
                    {order.items[0]?.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_COLORS[order.status] || "outline"} className="text-xs">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right font-black text-orange-500">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs text-orange-500 font-semibold hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-400">No orders found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={page <= 1 ? "pointer-events-none opacity-40" : ""}
          >
            <Link href={`/admin/orders?page=${page - 1}${sp.status ? `&status=${sp.status}` : ""}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-600 font-semibold">
            Page {page} of {totalPages}
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
          >
            <Link href={`/admin/orders?page=${page + 1}${sp.status ? `&status=${sp.status}` : ""}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
