"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Coins,
  Leaf,
  Package,
  IndianRupee,
  Gift,
  TreePine,
  Heart,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
} from "lucide-react";
import { getCreditLedger, redeemCredits, type CreditTxn } from "@/lib/api";

const CO2_PER_CREDIT = 0.016;
const USER_ID = "USER001";

const REDEEM = [
  { emoji: "🎁", title: "₹50 Amazon Voucher", cost: 100, icon: Gift },
  { emoji: "🌱", title: "Plant a Tree", cost: 50, icon: TreePine },
  { emoji: "❤️", title: "Donate to CRY", cost: 25, icon: Heart },
];

export default function CreditsPage() {
  const [balance, setBalance] = useState<number>(0);
  const [txns, setTxns] = useState<CreditTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const ledger = await getCreditLedger(USER_ID);
      setBalance(ledger.balance);
      setTxns(ledger.transactions ?? []);
    } catch {
      /* leave previous values on failure */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRedeem(reward: string, cost: number) {
    setBusy(reward);
    try {
      const res = await redeemCredits({ user_id: USER_ID, amount: cost, reward });
      setToast(res.message);
      if (res.ok) await load();
    } catch {
      setToast("Could not redeem right now. Please try again.");
    } finally {
      setBusy(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  const co2 = (balance * CO2_PER_CREDIT).toFixed(2);
  const creditCount = txns.filter((t) => t.type === "credit").length;
  const tier = balance > 500 ? "Gold" : balance > 200 ? "Silver" : "Bronze";
  const toGold = Math.max(0, 501 - balance);
  const tierPct = Math.min(100, (balance / 501) * 100);

  const stats = [
    { label: "Total Credits", value: balance.toLocaleString("en-IN"), icon: Coins, tint: "#FF9900" },
    { label: "CO₂ Saved", value: `${co2} kg`, icon: Leaf, tint: "#067D62" },
    { label: "Returns Rewarded", value: `${creditCount}`, icon: Package, tint: "#007185" },
    { label: "Credits Value", value: `₹${Math.round(balance / 2)}`, icon: IndianRupee, tint: "#FF9900" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-24 z-50 flex items-center gap-2 rounded-md bg-[#067D62] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-2 flex items-center gap-1 text-xs text-[#565959]">
        <span className="text-[#007185]">Your Account</span>
        <ChevronRight className="h-3 w-3" />
        <span>Green Credits</span>
      </nav>

      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#0F1111]">
            ReLife Impact &amp; Green Credits
          </h1>
          <p className="text-sm text-[#565959]">Account: {USER_ID}</p>
        </div>
        <span className="rounded-sm bg-[#F0FAF7] px-2 py-1 text-xs font-medium text-[#067D62]">
          {loading ? "Loading…" : "● Live ledger"}
        </span>
      </div>

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-md border border-[#D5D9D9] bg-white p-4"
          >
            <div className="rounded-md p-2.5" style={{ backgroundColor: `${s.tint}1A` }}>
              <s.icon className="h-6 w-6" style={{ color: s.tint }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0F1111]">{s.value}</p>
              <p className="text-xs text-[#565959]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        {/* Hero balance */}
        <div className="flex flex-col items-center rounded-md border border-[#D5D9D9] bg-white p-6 text-center">
          <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#FF9900] to-[#F0820A] text-white shadow-inner">
            <span className="text-4xl font-bold">{balance}</span>
            <span className="text-xs opacity-90">credits</span>
          </div>
          <p className="mt-3 font-bold text-[#0F1111]">ReLife Green Credits</p>

          <div className="mt-4 w-full">
            <div className="mb-1 flex justify-between text-xs text-[#565959]">
              <span className="font-medium text-[#0F1111]">{tier} Member</span>
              <span>{tier === "Gold" ? "Top tier" : `${toGold} to Gold`}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7E9EC]">
              <div className="h-full bg-[#FF9900]" style={{ width: `${tierPct}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-[#979aa0]">
              Bronze 0–200 • Silver 201–500 • Gold 501+
            </p>
          </div>
        </div>

        {/* Transaction ledger */}
        <div className="rounded-md border border-[#D5D9D9] bg-white">
          <div className="border-b border-[#D5D9D9] px-4 py-2.5">
            <h2 className="text-base font-bold text-[#0F1111]">
              Transaction History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D9] bg-[#F7F8F8] text-left text-xs uppercase text-[#565959]">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {txns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#565959]">
                      {loading
                        ? "Loading your ledger…"
                        : "No transactions yet. Complete a ReLife Journey to earn Green Credits."}
                    </td>
                  </tr>
                ) : (
                  txns.map((t) => {
                    const credit = t.type === "credit";
                    return (
                      <tr
                        key={t.txn_id}
                        className="border-b border-[#EAEDED] last:border-0"
                      >
                        <td className="px-4 py-2.5 text-xs text-[#565959]">
                          {fmtDate(t.created_at)}
                        </td>
                        <td className="px-4 py-2.5 text-[#0F1111]">{t.reason}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
                              credit
                                ? "bg-[#F0FAF7] text-[#067D62]"
                                : "bg-[#FCE9EC] text-[#CC0C39]"
                            }`}
                          >
                            {credit ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownLeft className="h-3 w-3" />
                            )}
                            {credit ? "Credit" : "Debit"}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-bold ${
                            credit ? "text-[#067D62]" : "text-[#CC0C39]"
                          }`}
                        >
                          {credit ? "+" : "−"}
                          {t.amount}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[#565959]">
                          {t.balance_after}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Redeem */}
      <h2 className="mb-3 mt-6 text-lg font-bold text-[#0F1111]">
        Redeem Your Credits
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {REDEEM.map((r) => {
          const affordable = balance >= r.cost;
          const isBusy = busy === r.title;
          return (
            <div
              key={r.title}
              className="flex flex-col rounded-md border border-[#D5D9D9] bg-white p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <r.icon className="h-6 w-6 text-[#FF9900]" />
                <span className="text-2xl">{r.emoji}</span>
              </div>
              <p className="font-bold text-[#0F1111]">{r.title}</p>
              <p className="mb-3 text-sm text-[#565959]">{r.cost} credits</p>
              <button
                onClick={() => handleRedeem(r.title, r.cost)}
                disabled={!affordable || isBusy}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#FA8900] disabled:cursor-not-allowed disabled:border-[#D5D9D9] disabled:bg-[#E7E9EC] disabled:text-[#979aa0]"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Redeeming…
                  </>
                ) : affordable ? (
                  "Redeem"
                ) : (
                  "Not enough credits"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("en-IN");
}
