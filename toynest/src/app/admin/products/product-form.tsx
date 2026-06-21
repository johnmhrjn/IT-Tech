"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify, SAFETY_BADGES, AGE_RANGES } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  categoryId: string;
  ageMin: number;
  ageMax: number;
  safetyBadges: string[];
  tags: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface Props {
  product?: ProductData;
  categories: Category[];
}

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const isEdit = !!product?.id;

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    price: product?.price?.toString() || "",
    compareAtPrice: product?.compareAtPrice?.toString() || "",
    images: product?.images?.join("\n") || "",
    categoryId: product?.categoryId || (categories[0]?.id || ""),
    ageMin: product?.ageMin?.toString() || "0",
    ageMax: product?.ageMax?.toString() || "12",
    safetyBadges: product?.safetyBadges || [] as string[],
    tags: product?.tags?.join(", ") || "",
    stock: product?.stock?.toString() || "0",
    isActive: product?.isActive !== false,
    isFeatured: product?.isFeatured || false,
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "name" && !isEdit ? { slug: slugify(e.target.value) } : {}),
    }));
  };

  const toggleBadge = (badge: string) => {
    setForm((f) => ({
      ...f,
      safetyBadges: f.safetyBadges.includes(badge)
        ? f.safetyBadges.filter((b) => b !== badge)
        : [...f.safetyBadges, badge],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        categoryId: form.categoryId,
        ageMin: parseInt(form.ageMin),
        ageMax: parseInt(form.ageMax),
        safetyBadges: form.safetyBadges,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        stock: parseInt(form.stock),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
      };

      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product?.id || !confirm("Are you sure you want to deactivate this product?")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
            <h2 className="font-black text-gray-900">Product Details</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
              <Input required value={form.name} onChange={set("name")} placeholder="e.g. Building Blocks Set" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug *</label>
              <Input required value={form.slug} onChange={set("slug")} placeholder="building-blocks-set" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
              <Input
                value={form.shortDescription}
                onChange={set("shortDescription")}
                placeholder="Brief one-line description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={set("description")}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none resize-none"
                placeholder="Full product description..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-black text-gray-900 mb-4">Images</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Image URLs (one per line)
              </label>
              <textarea
                rows={4}
                value={form.images}
                onChange={set("images")}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none resize-none font-mono"
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-xs text-gray-400 mt-1">First image is used as the main product image</p>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
            <h2 className="font-black text-gray-900">SEO (optional)</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Title</label>
              <Input value={form.metaTitle} onChange={set("metaTitle")} maxLength={60} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={form.metaDescription}
                onChange={set("metaDescription")}
                maxLength={160}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
            <h2 className="font-black text-gray-900">Status</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded accent-orange-500"
              />
              <span className="text-sm font-semibold text-gray-700">Active (visible on store)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded accent-orange-500"
              />
              <span className="text-sm font-semibold text-gray-700">Featured (show on homepage)</span>
            </label>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
            <h2 className="font-black text-gray-900">Pricing</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (AUD) *</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={set("price")}
                placeholder="29.95"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Compare At Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.compareAtPrice}
                onChange={set("compareAtPrice")}
                placeholder="39.95"
              />
              <p className="text-xs text-gray-400 mt-1">Show as crossed-out original price</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock *</label>
              <Input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={set("stock")}
              />
            </div>
          </div>

          {/* Category */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
            <h2 className="font-black text-gray-900">Category & Age</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select
                required
                value={form.categoryId}
                onChange={set("categoryId")}
                className="w-full h-10 rounded-xl border-2 border-gray-200 px-3 text-sm focus:border-orange-400 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age Range</label>
              <div className="flex flex-wrap gap-1.5">
                {AGE_RANGES.map((range) => {
                  const active = form.ageMin === range.min.toString() && form.ageMax === range.max.toString();
                  return (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, ageMin: range.min.toString(), ageMax: range.max.toString() }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-colors ${
                        active
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs text-gray-500">Min age</label>
                  <Input type="number" min="0" max="18" value={form.ageMin} onChange={set("ageMin")} className="mt-0.5" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Max age</label>
                  <Input type="number" min="0" max="18" value={form.ageMax} onChange={set("ageMax")} className="mt-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Safety Badges */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-black text-gray-900 mb-3">Safety Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {SAFETY_BADGES.map((badge) => (
                <button
                  key={badge}
                  type="button"
                  onClick={() => toggleBadge(badge)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-colors ${
                    form.safetyBadges.includes(badge)
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-200 text-gray-600 hover:border-green-300"
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-black text-gray-900 mb-3">Tags</h2>
            <Input
              value={form.tags}
              onChange={set("tags")}
              placeholder="lego, building, stem (comma separated)"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {isEdit ? "Save Changes" : "Create Product"}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-red-500 hover:bg-red-50"
                onClick={handleDelete}
                loading={loading}
              >
                <Trash2 className="h-4 w-4" />
                Deactivate Product
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
