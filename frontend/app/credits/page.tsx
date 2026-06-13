"use client";

import { useState } from "react";
import { Leaf, Loader2, Gift, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { issueCredits, type CreditsResult } from "@/lib/api";

export default function CreditsPage() {
  const [balance, setBalance] = useState<number>(100);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleIssue() {
    setLoading(true);
    try {
      const res: CreditsResult = await issueCredits({ user_id: "demo-user" });
      setBalance(res.new_balance);
      setMessage(res.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Green Credits</h1>
        <p className="text-muted-foreground">
          Earn rewards every time you return responsibly and keep items in the
          loop.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-green-700 p-8 text-center text-primary-foreground">
          <Leaf className="mx-auto mb-3 h-10 w-10" />
          <p className="text-sm uppercase tracking-wide opacity-90">
            Current balance
          </p>
          <p className="text-5xl font-bold">{balance}</p>
          <p className="text-sm opacity-90">Green Credits</p>
        </div>
        <CardContent className="space-y-4 p-6">
          {message && (
            <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
              {message}
            </div>
          )}
          <Button className="w-full" onClick={handleIssue} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing…
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Issue Credits for a Return
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <TreePine className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">CO₂ Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12.4 kg</p>
            <p className="text-sm text-muted-foreground">
              Lifetime carbon avoided through resale &amp; reuse.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Gift className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">Redeem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use credits for discounts on certified refurbished items and
              peer-to-peer resale listings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
