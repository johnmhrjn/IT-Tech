export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, MapPin, User, CreditCard, Truck } from "lucide-react";
import { AdminOrderActions } from "./order-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "success" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, id: true } },
      items: { include: { product: { select: { slug: true } } } },
      address: true,
    },
  });

  if (!order) notFound();

  const customerName = order.user?.name || order.guestName || "Guest";
  const customerEmail = order.user?.email || order.guestEmail || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 font-mono">{order.orderNumber}</h1>
            <Badge variant={STATUS_COLORS[order.status] || "outline"}>{order.status}</Badge>
            <Badge variant={order.paymentStatus === "PAID" ? "success" : "secondary"}>
              {order.paymentStatus}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">Placed {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <Package className="h-5 w-5 text-orange-500" />
              <h2 className="font-black text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🧸</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="font-semibold text-gray-900 hover:text-orange-500 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-400">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-black text-gray-900">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span className="font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (10%)</span>
                <span className="font-semibold">{formatPrice(order.gst)}</span>
              </div>
              <div className="flex justify-between font-black text-base border-t border-gray-200 pt-2">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Update Order */}
          <AdminOrderActions order={order} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-orange-500" />
              <h3 className="font-bold text-gray-900">Customer</h3>
            </div>
            <p className="font-semibold text-gray-900">{customerName}</p>
            <p className="text-sm text-gray-500">{customerEmail}</p>
            {order.guestPhone && (
              <p className="text-sm text-gray-500">{order.guestPhone}</p>
            )}
            {order.userId && (
              <Link
                href={`/admin/customers?search=${customerEmail}`}
                className="text-xs text-orange-500 font-semibold hover:underline mt-2 block"
              >
                View customer →
              </Link>
            )}
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-orange-500" />
              <h3 className="font-bold text-gray-900">Shipping Address</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p>{order.shippingLine1}</p>
              {order.shippingLine2 && <p>{order.shippingLine2}</p>}
              <p>{order.shippingCity} {order.shippingState} {order.shippingPostcode}</p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-orange-500" />
              <h3 className="font-bold text-gray-900">Payment</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={order.paymentStatus === "PAID" ? "success" : "secondary"} className="text-xs">
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
              )}
              {order.paymentIntentId && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 font-mono break-all">{order.paymentIntentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracking */}
          {(order.trackingNumber || order.shippedAt) && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-4 w-4 text-orange-500" />
                <h3 className="font-bold text-gray-900">Shipping</h3>
              </div>
              <div className="space-y-1 text-sm">
                {order.trackingNumber && (
                  <div>
                    <p className="text-gray-500 text-xs">Tracking number</p>
                    <p className="font-mono font-semibold text-gray-900">{order.trackingNumber}</p>
                  </div>
                )}
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 text-xs font-semibold hover:underline block"
                  >
                    Track shipment →
                  </a>
                )}
                {order.shippedAt && (
                  <p className="text-gray-500 text-xs mt-2">Shipped {formatDate(order.shippedAt)}</p>
                )}
                {order.deliveredAt && (
                  <p className="text-green-600 text-xs">Delivered {formatDate(order.deliveredAt)}</p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h3 className="font-bold text-gray-900 mb-2">Customer Notes</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
