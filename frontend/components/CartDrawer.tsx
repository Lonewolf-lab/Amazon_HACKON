"use client";

import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { ProductThumb } from "./ProductThumb";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function CartDrawer() {
  const { items, isOpen, close, setQty, removeItem, subtotal, savings, count } =
    useCart();

  return (
    <>
      {/* Dimmed overlay */}
      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-in panel from the right (under the cart button) */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E7E7] bg-[#131921] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#FF9900]" />
            <span className="text-base font-bold">
              Your Cart{" "}
              <span className="text-[#FF9900]">({count})</span>
            </span>
          </div>
          <button
            onClick={close}
            aria-label="Close cart"
            className="rounded-full p-1 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-[#565959]">
              <ShoppingCart className="h-12 w-12 text-[#D5D9D9]" />
              <p className="text-sm font-medium text-[#0F1111]">
                Your cart is empty
              </p>
              <p className="text-xs">
                Add certified second-life products from the ReLife Marketplace.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#EAEDED]">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 p-3">
                  {/* Thumbnail */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[#E7E7E7] bg-[#F7F8F8]">
                    <ProductThumb
                      asin={it.asin}
                      id={it.id}
                      name={it.name}
                      className="h-full w-full object-contain p-1.5"
                      fallback={
                        <Package className="h-8 w-8 text-[#979aa0]" />
                      }
                    />
                  </div>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-2 text-sm font-medium text-[#0F1111]">
                      {it.name}
                    </p>
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-[#067D62]">
                      <ShieldCheck className="h-3 w-3" /> Grade {it.grade} ·
                      Certified
                    </span>
                    <span className="mt-0.5 text-sm font-bold text-[#0F1111]">
                      {inr(it.price)}
                    </span>

                    {/* Quantity stepper + remove */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-[#D5D9D9]">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQty(it.id, it.qty - 1)}
                          className="px-2 py-1 text-[#0F1111] hover:text-[#C7511F]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">
                          {it.qty}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQty(it.id, it.qty + 1)}
                          className="px-2 py-1 text-[#0F1111] hover:text-[#067D62]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="flex items-center gap-1 text-xs text-[#007185] hover:text-[#C7511F] hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer / totals */}
        {items.length > 0 && (
          <div className="border-t border-[#E7E7E7] bg-[#F7FAFA] px-4 py-3">
            {savings > 0 && (
              <p className="mb-1 flex items-center justify-between text-xs text-[#067D62]">
                <span className="flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5" /> You save vs. new
                </span>
                <span className="font-bold">{inr(savings)}</span>
              </p>
            )}
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm text-[#0F1111]">
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </span>
              <span className="text-xl font-bold text-[#0F1111]">
                {inr(subtotal)}
              </span>
            </div>
            <button className="w-full rounded-full border border-[#FCD200] bg-[#FFD814] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#F7CA00]">
              Proceed to Buy
            </button>
            <button
              onClick={close}
              className="mt-2 w-full rounded-full border border-[#D5D9D9] bg-white py-2 text-sm font-medium text-[#0F1111] hover:bg-[#F7FAFA]"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
