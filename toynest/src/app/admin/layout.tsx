import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, BarChart3, LogOut, Home
} from "lucide-react";
import { signOut } from "@/lib/auth";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/coupons", icon: Tag, label: "Coupons" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-gray-900 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <Link href="/" className="text-xl font-black text-white">
            Toy<span className="text-yellow-400">Nest</span> 🧸
          </Link>
          <div className="text-xs text-gray-400 mt-0.5">Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-semibold"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-semibold"
          >
            <Home className="h-4 w-4" /> View Store
          </Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/30 transition-colors text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div />
          <div className="text-sm text-gray-600 font-semibold">
            {session.user.name} · Admin
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
