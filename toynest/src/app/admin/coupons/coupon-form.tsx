"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewCouponForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minOrder: "",
    maxUses: "",
    expiresAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          description: form.description || undefined,
          type: form.type,
          value: parseFloat(form.value),
          minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setSuccess(true);
      setForm({ code: "", description: "", type: "PERCENTAGE", value: "", minOrder: "", maxUses: "", expiresAt: "" });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
          Coupon created successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Code *</label>
        <Input
          required
          value={form.code}
          onChange={set("code")}
          placeholder="SAVE10"
          className="uppercase"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
        <Input value={form.description} onChange={set("description")} placeholder="10% off all orders" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
        <select
          required
          value={form.type}
          onChange={set("type")}
          className="w-full h-10 rounded-xl border-2 border-gray-200 px-3 text-sm focus:border-orange-400 focus:outline-none"
        >
          <option value="PERCENTAGE">Percentage (%)</option>
          <option value="FLAT">Flat Amount ($)</option>
          <option value="FREE_SHIPPING">Free Shipping</option>
        </select>
      </div>

      {form.type !== "FREE_SHIPPING" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Value * {form.type === "PERCENTAGE" ? "(%)" : "(AUD)"}
          </label>
          <Input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.value}
            onChange={set("value")}
            placeholder={form.type === "PERCENTAGE" ? "10" : "15.00"}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum Order (AUD)</label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={form.minOrder}
          onChange={set("minOrder")}
          placeholder="50.00"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Max Uses</label>
        <Input
          type="number"
          min="1"
          value={form.maxUses}
          onChange={set("maxUses")}
          placeholder="Unlimited"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
        <Input type="datetime-local" value={form.expiresAt} onChange={set("expiresAt")} />
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Create Coupon
      </Button>
    </form>
  );
}
