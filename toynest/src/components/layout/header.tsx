"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Heart, User, Search, Menu, X, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

const NAV_LINKS = [
  { href: "/products?category=educational-stem", label: "STEM" },
  { href: "/products?category=action-figures-dolls", label: "Dolls & Figures" },
  { href: "/products?category=outdoor-sports", label: "Outdoor" },
  { href: "/products?category=arts-crafts", label: "Arts & Crafts" },
];

export function Header() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-orange-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-black text-orange-500 tracking-tight">
              Toy<span className="text-yellow-400">Nest</span>
            </span>
            <span className="text-xl">🧸</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/wishlist"
              className="p-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="relative group hidden sm:block">
                <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-orange-50 transition-colors">
                  <User className="h-4 w-4" />
                  <span>{session.user.name?.split(" ")[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 rounded-2xl border border-gray-100 bg-white shadow-lg py-2">
                  <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50 text-gray-700">
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50 text-gray-700">
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50 text-orange-600 font-semibold">
                      Admin Panel
                    </Link>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}

            <button
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-orange-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3">
            <form action="/products" method="GET">
              <input
                name="q"
                autoFocus
                placeholder="Search for toys..."
                className="w-full rounded-xl border-2 border-orange-300 bg-orange-50 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </form>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-orange-100 pt-3 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm font-semibold text-gray-700 hover:text-orange-500"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <Button asChild size="sm" className="mt-2 w-full">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-left py-2 text-sm text-red-600 font-semibold"
              >
                Sign Out
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
