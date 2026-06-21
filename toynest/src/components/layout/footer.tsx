import Link from "next/link";
import { Globe, Share2, LinkIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-black text-white mb-2">
              Toy<span className="text-yellow-400">Nest</span> 🧸
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Australia&apos;s favourite kids&apos; toy store. Safe, fun, and age-appropriate toys delivered to your door.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-xl bg-gray-800 hover:bg-orange-500 transition-colors">
                <Share2 className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-gray-800 hover:bg-orange-500 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-gray-800 hover:bg-orange-500 transition-colors">
                <LinkIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold text-white mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=educational-stem" className="hover:text-orange-400 transition-colors">STEM Toys</Link></li>
              <li><Link href="/products?category=action-figures-dolls" className="hover:text-orange-400 transition-colors">Dolls & Figures</Link></li>
              <li><Link href="/products?category=outdoor-sports" className="hover:text-orange-400 transition-colors">Outdoor & Sports</Link></li>
              <li><Link href="/products?category=arts-crafts" className="hover:text-orange-400 transition-colors">Arts & Crafts</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-orange-400 transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-bold text-white mb-3">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/track" className="hover:text-orange-400 transition-colors">Track My Order</Link></li>
              <li><Link href="/faq" className="hover:text-orange-400 transition-colors">FAQ</Link></li>
              <li><Link href="/returns" className="hover:text-orange-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/shipping" className="hover:text-orange-400 transition-colors">Shipping Info</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="font-bold text-white mb-3">Safe Shopping</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> SSL Secured Checkout
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Australian Consumer Law
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Safety Certified Toys
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Secure Payments
              </li>
            </ul>
            <div className="mt-4 flex gap-2 flex-wrap">
              <div className="text-xs bg-gray-800 rounded-lg px-2 py-1">Visa</div>
              <div className="text-xs bg-gray-800 rounded-lg px-2 py-1">Mastercard</div>
              <div className="text-xs bg-gray-800 rounded-lg px-2 py-1">PayPal</div>
              <div className="text-xs bg-gray-800 rounded-lg px-2 py-1">Afterpay</div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ToyNest Australia. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
