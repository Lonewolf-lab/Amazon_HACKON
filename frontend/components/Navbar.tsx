"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, MapPin, ChevronDown, UserCog, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersona, PERSONAS } from "@/lib/persona";
import { useCart } from "@/lib/cart";

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
  const { count, toggle } = useCart();

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
              <p className="text-[11px] text-gray-300">Deliver to</p>
              <p className="text-[13px] font-bold">Select your address</p>
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

          {/* Persona switcher — drives personalized recommendations */}
          <PersonaSwitcher />

          {/* Returns & Orders */}
          <Link
            href="/portal"
            className="hidden flex-col justify-center rounded-sm border border-transparent px-2 py-1 leading-tight hover:border-white md:flex"
          >
            <span className="text-[11px]">Returns</span>
            <span className="text-[13px] font-bold">&amp; Orders</span>
          </Link>

          {/* Cart */}
          <button
            onClick={toggle}
            aria-label="Open cart"
            className="flex cursor-pointer items-end gap-1 rounded-sm border border-transparent px-2 py-1 hover:border-white"
          >
            <div className="relative">
              <ShoppingCart className="h-7 w-7" />
              <span className="absolute -top-1 left-3 text-sm font-bold text-[#FF9900]">
                {count}
              </span>
            </div>
            <span className="hidden text-[13px] font-bold sm:inline">Cart</span>
          </button>
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

function PersonaSwitcher() {
  const { persona, setUserId } = usePersona();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden md:block">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex flex-col justify-start rounded-sm border border-transparent px-2 py-1 text-left leading-tight hover:border-white"
      >
        <span className="flex items-center gap-1 text-[11px] text-gray-300">
          <UserCog className="h-3 w-3" /> Viewing as · {persona.userId}
        </span>
        <span className="flex items-center text-[13px] font-bold text-white">
          {persona.label} <ChevronDown className="h-3 w-3" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-64 overflow-hidden rounded-md border border-[#D5D9D9] bg-white text-[#0F1111] shadow-lg">
          <p className="border-b border-[#EAEDED] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#565959]">
            Shop as a different shopper
          </p>
          {PERSONAS.map((p, i) => {
            const active = p.userId === persona.userId;
            return (
              <button
                key={p.userId}
                onMouseDown={() => {
                  setUserId(p.userId);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#F7FAFA] ${
                  active ? "bg-[#FFF7E6]" : ""
                }`}
              >
                <span className="mt-0.5 h-4 w-4 shrink-0">
                  {active && <Check className="h-4 w-4 text-[#067D62]" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{p.label}</span>
                    <span className="rounded-sm bg-[#EEF6FB] px-1 py-0.5 text-[10px] font-bold text-[#007185]">
                      User {i + 1} · {p.userId}
                    </span>
                  </span>
                  <span className="block text-xs text-[#565959]">{p.blurb}</span>
                </span>
              </button>
            );
          })}
          <p className="border-t border-[#EAEDED] px-3 py-2 text-[11px] text-[#565959]">
            Recommendations adapt to the selected shopper.
          </p>
        </div>
      )}
    </div>
  );
}

export default Navbar;
