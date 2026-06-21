import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postcode: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit postcode"),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(10, "Review must be at least 10 characters"),
});

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FLAT", "FREE_SHIPPING"]),
  value: z.number().positive("Value must be positive"),
  minOrder: z.number().optional(),
  maxUses: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description required"),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().optional(),
  categoryId: z.string().min(1, "Category is required"),
  ageMin: z.number().min(0),
  ageMax: z.number().max(18),
  safetyBadges: z.array(z.string()),
  tags: z.array(z.string()),
  stock: z.number().int().min(0),
  isFeatured: z.boolean().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ProductInput = z.infer<typeof productSchema>;
