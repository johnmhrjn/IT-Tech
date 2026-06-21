"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, Truck, CheckCircle, Clock, Search } from "lucide-react";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
};

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  const handleTrack = async () => {
    if (!orderNumber.trim() || !email.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    const res = await fetch(
      `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Order not found");
    } else {
      setOrder(data.order);
    }
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12 flex-1">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-3xl font-black text-gray-900">Track Your Order</h1>
          <p className="text-gray-500 mt-2">Enter your order number and email to see your order status</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order Number</label>
              <Input
                placeholder="e.g. TN-ABC123-XYZ"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <Input
                type="email"
                placeholder="The email used at checkout"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</div>
            )}
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleTrack}
              loading={loading}
            >
              <Search className="h-5 w-5" /> Track Order
            </Button>
          </div>
        </div>

        {order && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-black text-gray-900 text-lg">{order.orderNumber}</h2>
                <p className="text-sm text-gray-500">Placed {formatDate(order.createdAt)}</p>
              </div>
              <Badge
                variant={
                  order.status === "DELIVERED" ? "success"
                  : order.status === "CANCELLED" ? "destructive"
                  : "default"
                }
              >
                {STATUS_LABELS[order.status]}
              </Badge>
            </div>

            {/* Progress */}
            {!["CANCELLED", "REFUNDED"].includes(order.status) && (
              <div className="mb-8">
                <div className="flex items-center gap-0">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const Icon = STATUS_ICONS[step] || Clock;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center w-full">
                          {i > 0 && (
                            <div className={`h-1 flex-1 ${i <= currentStep ? "bg-orange-500" : "bg-gray-200"}`} />
                          )}
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 shrink-0 ${done ? "bg-orange-500 border-orange-500 text-white" : "border-gray-200 text-gray-400"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`h-1 flex-1 ${i < currentStep ? "bg-orange-500" : "bg-gray-200"}`} />
                          )}
                        </div>
                        <span className={`text-xs mt-1.5 text-center ${done ? "text-orange-500 font-semibold" : "text-gray-400"}`}>
                          {STATUS_LABELS[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Tracking Number</p>
                  <p className="font-bold text-gray-900">{order.trackingNumber}</p>
                </div>
                {order.trackingUrl && (
                  <Button asChild size="sm" variant="outline" className="border-blue-300 text-blue-600">
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                      Track Parcel
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Items ({order.items.length})</h3>
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-orange-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
