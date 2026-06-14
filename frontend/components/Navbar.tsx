"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/portal", label: "ReLife Journey" },
  { href: "/marketplace", label: "ReLife Marketplace" },
  { href: "/tradein", label: "Trade-In" },
  { href: "/credits", label: "Impact" },
  { href: "/product", label: "Smart Buy" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main dark nav (#131921) — amazon.com header */}
      <div className="bg-[#131921] text-white">
        <div className="mx-auto flex h-[60px] max-w-[1500px] items-center gap-2 px-2 sm:gap-4 sm:px-4">
          {/* Logo + tagline */}
          <Link
            href="/"
            className="flex shrink-0 flex-col justify-center rounded-sm border border-transparent px-2 py-1 hover:border-white"
          >
            <span className="text-2xl font-bold leading-none text-[#FF9900]">
              ReLife<span className="text-white"> AI</span>
            </span>
            <span className="hidden text-[10px] leading-tight text-gray-300 sm:block">
              Every Product Deserves a Second Life
            </span>
          </Link>

          {/* Deliver to (mock) */}
          <div className="hidden items-end gap-0.5 rounded-sm border border-transparent px-2 py-1 hover:border-white lg:flex">
            <MapPin className="mb-0.5 h-4 w-4 text-gray-300" />
            <div className="leading-tight">
              <p className="text-[11px] text-gray-300">Deliver to Sid</p>
              <p className="text-[13px] font-bold">Mumbai 400001</p>
            </div>
          </div>

          {/* Search bar (mock) */}
          <div className="flex h-10 flex-1 items-center overflow-hidden rounded-sm">
            <button className="flex h-full items-center gap-1 rounded-l-sm bg-[#E6E6E6] px-3 text-xs text-[#0F1111] hover:bg-[#d4d4d4]">
              All <ChevronDown className="h-3 w-3" />
            </button>
            <input
              type="text"
              placeholder="Search Amazon ReLife AI"
              className="h-full flex-1 px-3 text-sm text-[#0F1111] outline-none"
            />
            <button
              aria-label="Search"
              className="flex h-full items-center justify-center rounded-r-sm bg-[#FF9900] px-4 hover:bg-[#f3a847]"
            >
              <Search className="h-5 w-5 text-[#131921]" />
            </button>
          </div>

          {/* Account */}
          <div className="hidden cursor-pointer flex-col justify-center rounded-sm border border-transparent px-2 py-1 leading-tight hover:border-white md:flex">
            <span className="text-[11px]">Hello, Sid</span>
            <span className="flex items-center text-[13px] font-bold">
              Account &amp; Lists <ChevronDown className="h-3 w-3" />
            </span>
          </div>

          {/* Returns & Orders */}
          <Link
            href="/portal"
            className="hidden flex-col justify-center rounded-sm border border-transparent px-2 py-1 leading-tight hover:border-white md:flex"
          >
            <span className="text-[11px]">Returns</span>
            <span className="text-[13px] font-bold">&amp; Orders</span>
          </Link>

          {/* Cart */}
          <div className="flex cursor-pointer items-end gap-1 rounded-sm border border-transparent px-2 py-1 hover:border-white">
            <div className="relative">
              <ShoppingCart className="h-7 w-7" />
              <span className="absolute -top-1 left-3 text-sm font-bold text-[#FF9900]">
                3
              </span>
            </div>
            <span className="hidden text-[13px] font-bold sm:inline">Cart</span>
          </div>
        </div>
      </div>

      {/* Secondary orange nav bar */}
      <div className="bg-[#FF9900]">
        <nav className="mx-auto flex max-w-[1500px] items-center gap-1 px-2 sm:px-4">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b-2 px-3 py-2 text-[13px] font-medium text-[#131921] transition-colors hover:bg-[#f3a847]",
                  active
                    ? "border-white font-semibold"
                    : "border-transparent"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
