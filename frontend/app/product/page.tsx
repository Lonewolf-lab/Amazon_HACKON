"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KeepRateBadge } from "@/components/KeepRateBadge";
import { getPreventScore, type PreventScore } from "@/lib/api";

export default function ProductPage() {
  const [score, setScore] = useState<PreventScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPreventScore({ product_id: "demo-sku-001" })
      .then(setScore)
      .catch(() => setError("Could not reach the prevention service."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product image */}
        <Card className="overflow-hidden">
          <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-muted to-muted/40">
            <ShoppingCart className="h-24 w-24 text-muted-foreground/40" />
          </div>
        </Card>

        {/* Product details */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-primary">ReLoop Apparel</p>
            <h1 className="text-3xl font-bold">Everyday Merino Crew Sweater</h1>
            <p className="mt-1 text-2xl font-semibold">₹2,499</p>
          </div>

          <p className="text-muted-foreground">
            Lightweight, breathable merino wool in a classic crew neck. Backed by
            ReLoop predictive return prevention so you buy with confidence.
          </p>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Scoring keep rate…
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {score && <KeepRateBadge score={score} />}

          <div className="flex gap-3 pt-2">
            <Button size="lg" className="flex-1">
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
