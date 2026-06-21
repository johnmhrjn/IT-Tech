import type { Product, Category, Order, OrderItem, Review, User, CartItem } from "@prisma/client";

export type ProductWithCategory = Product & {
  category: Category;
};

export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
  user?: Pick<User, "id" | "name" | "email"> | null;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">;
};

export interface CartState {
  items: CartItemWithProduct[];
  total: number;
  itemCount: number;
}

export interface CheckoutSession {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  gst: number;
  total: number;
  couponCode?: string;
}

export interface FilterParams {
  category?: string;
  ageMin?: number;
  ageMax?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "rating" | "popular";
  q?: string;
  page?: number;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}
