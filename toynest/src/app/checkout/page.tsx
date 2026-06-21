"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, calculateGST, AU_STATES } from "@/lib/utils";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";

type Step = "shipping" | "payment" | "confirmation";

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("shipping");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [stripeRef, setStripeRef] = useState<Stripe | null>(null);
  const [elementsRef, setElementsRef] = useState<StripeElements | null>(null);
  const paymentElementRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ShippingForm>({
    firstName: "", lastName: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "NSW", postcode: "",
  });

  const shipping = total >= 75 ? 0 : 9.95;
  const gst = calculateGST(total + shipping);
  const finalTotal = total + shipping + gst;

  useEffect(() => {
    if (step === "payment" && paymentElementRef.current && stripeRef && elementsRef) {
      const element = elementsRef.create("payment");
      element.mount(paymentElementRef.current);
    }
  }, [step, stripeRef, elementsRef]);

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shipping: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone || undefined,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            postcode: form.postcode,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      setOrderId(data.orderId);
      setOrderNumber(data.orderNumber);

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) throw new Error("Failed to load payment processor");

      const elements = stripe.elements({ clientSecret: data.clientSecret, appearance: { theme: "stripe" } });
      setStripeRef(stripe);
      setElementsRef(elements);
      setStep("payment");
    } catch (err: unknown) {
      toast({
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive" as never,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeRef || !elementsRef) return;

    setLoading(true);
    try {
      const { error } = await stripeRef.confirmPayment({
        elements: elementsRef,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?confirmed=true`,
          payment_method_data: {
            billing_details: {
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
              phone: form.phone,
              address: {
                line1: form.line1,
                line2: form.line2,
                city: form.city,
                state: form.state,
                postal_code: form.postcode,
                country: "AU",
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (error) throw new Error(error.message);

      clearCart();
      setStep("confirmation");
    } catch (err: unknown) {
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive" as never,
      });
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof ShippingForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  if (items.length === 0 && step !== "confirmation") {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Your cart is empty</h1>
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
          <Link href="/cart" className="flex items-center gap-1 hover:text-orange-500">
            <ArrowLeft className="h-4 w-4" /> Cart
          </Link>
          <span>/</span>
          <span className={step === "shipping" ? "text-orange-500 font-semibold" : ""}>Shipping</span>
          <span>/</span>
          <span className={step === "payment" ? "text-orange-500 font-semibold" : ""}>Payment</span>
        </div>

        {step === "confirmation" ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3">Order Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for your order, {form.firstName}!
            </p>
            <p className="text-gray-500 mb-1">
              Order number: <span className="font-bold text-gray-900">{orderNumber}</span>
            </p>
            <p className="text-gray-500 mb-8">
              A confirmation email has been sent to <span className="font-semibold">{form.email}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/track?order=${orderNumber}&email=${form.email}`}>
                  Track Order
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              {step === "shipping" ? (
                <form onSubmit={handleShippingSubmit} className="space-y-5">
                  <h2 className="text-xl font-black text-gray-900">Contact & Shipping</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                      <Input required {...field("firstName")} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                      <Input required {...field("lastName")} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <Input type="email" required {...field("email")} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <Input type="tel" placeholder="04XX XXX XXX" {...field("phone")} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 1 *</label>
                    <Input required placeholder="Street number and name" {...field("line1")} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 2</label>
                    <Input placeholder="Apartment, suite, unit, etc." {...field("line2")} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                      <Input required {...field("city")} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
                      <select
                        required
                        className="w-full h-10 rounded-xl border-2 border-gray-200 px-3 text-sm focus:border-orange-400 focus:outline-none"
                        value={form.state}
                        onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      >
                        {AU_STATES.map((s) => (
                          <option key={s.value} value={s.value}>{s.value}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Postcode *</label>
                      <Input required maxLength={4} pattern="[0-9]{4}" placeholder="0000" {...field("postcode")} />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" loading={loading}>
                    Continue to Payment
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                  <h2 className="text-xl font-black text-gray-900">Payment</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5">
                    <Lock className="h-4 w-4 text-green-500" />
                    Your payment is secured with SSL encryption
                  </div>
                  <div
                    ref={paymentElementRef}
                    className="min-h-[200px] rounded-2xl border-2 border-gray-200 p-4"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("shipping")}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" size="lg" className="flex-1" loading={loading}>
                      Pay {formatPrice(finalTotal)}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-gray-400">
                    Afterpay, Visa, Mastercard, PayPal accepted
                  </p>
                </form>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 sticky top-20">
                <h3 className="font-black text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl">🧸</div>
                        )}
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (10%)</span>
                    <span className="font-semibold">{formatPrice(gst)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-black">
                    <span>Total (AUD)</span>
                    <span className="text-orange-500">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
