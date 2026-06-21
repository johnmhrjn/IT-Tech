export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 20;

  const where = sp.search
    ? {
        role: "CUSTOMER" as const,
        OR: [
          { name: { contains: sp.search, mode: "insensitive" as const } },
          { email: { contains: sp.search, mode: "insensitive" as const } },
        ],
      }
    : { role: "CUSTOMER" as const };

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
        orders: {
          where: { paymentStatus: "PAID" },
          select: { total: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Customers ({total})</h1>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/customers" className="flex gap-2 max-w-sm">
        <input
          name="search"
          defaultValue={sp.search}
          placeholder="Search by name or email..."
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
        <Button type="submit" size="sm" variant="outline" className="gap-1">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Customer</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Joined</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Orders</th>
                <th className="text-right px-5 py-3 font-bold text-gray-700">Total Spent</th>
                <th className="text-left px-5 py-3 font-bold text-gray-700">Auth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0);
                const hasPassword = !!customer.password;

                return (
                  <tr key={customer.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-black text-orange-600 shrink-0">
                          {(customer.name || customer.email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{customer.name || "No name"}</div>
                          <div className="text-xs text-gray-400">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-gray-900">{customer._count.orders}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-orange-500">
                      {formatPrice(totalSpent)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-xs">
                        {hasPassword ? "Email" : "Social"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-400">No customers found</div>
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
            <Link href={`/admin/customers?page=${page - 1}${sp.search ? `&search=${sp.search}` : ""}`}>
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
            <Link href={`/admin/customers?page=${page + 1}${sp.search ? `&search=${sp.search}` : ""}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
