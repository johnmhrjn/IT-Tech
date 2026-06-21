export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { NewCouponForm } from "./coupon-form";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Coupons ({coupons.length})</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coupon list */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Code</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Type</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Value</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Used</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Expires</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coupons.map((coupon) => {
                    const isExpired = coupon.expiresAt ? coupon.expiresAt < new Date() : false;
                    const isExhausted = coupon.maxUses ? coupon.usedCount >= coupon.maxUses : false;
                    const effectiveStatus = !coupon.isActive || isExpired || isExhausted ? "inactive" : "active";

                    return (
                      <tr key={coupon.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-black text-gray-900 text-sm tracking-wider">
                            {coupon.code}
                          </span>
                          {coupon.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{coupon.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{coupon.type}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">
                          {coupon.type === "PERCENTAGE"
                            ? `${coupon.value}%`
                            : formatPrice(coupon.value)}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {coupon.usedCount}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={effectiveStatus === "active" ? "success" : "outline"} className="text-xs">
                            {effectiveStatus === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {coupons.length === 0 && (
              <div className="text-center py-12 text-gray-400">No coupons created yet</div>
            )}
          </div>
        </div>

        {/* Create new coupon */}
        <div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Plus className="h-5 w-5 text-orange-500" />
              <h2 className="font-black text-gray-900">Create Coupon</h2>
            </div>
            <NewCouponForm />
          </div>
        </div>
      </div>
    </div>
  );
}
