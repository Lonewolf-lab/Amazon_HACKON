"use client";

import { useState, type ReactNode } from "react";
import { productImage } from "@/lib/catalog";

/* Renders a real product photo when one is available, otherwise the caller's
   fallback (usually a category icon). Used by marketplace cards, the cart
   drawer, and the product detail page so imagery is consistent everywhere. */
export function ProductThumb({
  asin,
  id,
  name,
  className,
  fallback,
}: {
  asin?: string;
  id?: string;
  name: string;
  className?: string;
  fallback: ReactNode;
}) {
  const src = productImage(asin, id, name);
  const [err, setErr] = useState(false);

  if (!src || err) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className={className}
    />
  );
}

export default ProductThumb;
