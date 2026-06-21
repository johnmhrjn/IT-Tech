"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, RefreshCw } from "lucide-react";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

interface Order {
  id: string;
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  supplierOrderId: string | null;
}

export function AdminOrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [supplierOrderId, setSupplierOrderId] = useState(order.supplierOrderId || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          trackingUrl: trackingUrl || undefined,
          supplierOrderId: supplierOrderId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // ignore for brevity
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <RefreshCw className="h-5 w-5 text-orange-500" />
        <h2 className="font-black text-gray-900">Update Order</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order Status</label>
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                  status === s
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1">
                <Truck className="h-3 w-3" /> Tracking Number
              </span>
            </label>
            <Input
              placeholder="e.g. 123456789AU"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tracking URL</label>
            <Input
              placeholder="https://..."
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Supplier Order ID</label>
          <Input
            placeholder="Supplier reference number"
            value={supplierOrderId}
            onChange={(e) => setSupplierOrderId(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleUpdate} loading={loading}>
            Save Changes
          </Button>
          {success && (
            <span className="text-sm text-green-600 font-semibold">
              ✓ Order updated successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
