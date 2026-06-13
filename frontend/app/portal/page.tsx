"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { GradeResult } from "@/components/GradeResult";
import {
  gradeItem,
  getRedirectPaths,
  type GradeResult as GradeResultType,
  type RedirectPath,
} from "@/lib/api";

export default function PortalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState<GradeResultType | null>(null);
  const [paths, setPaths] = useState<RedirectPath[] | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    try {
      const form = new FormData();
      if (file) form.append("image", file);
      const [gradeRes, pathRes] = await Promise.all([
        gradeItem(form),
        getRedirectPaths({ product_id: "demo-sku-001" }),
      ]);
      setGrade(gradeRes);
      setPaths(pathRes);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Seller Return Portal</h1>
        <p className="text-muted-foreground">
          Upload the returned item for smart quality grading and a recommended
          disposition path.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Upload the returned item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload onFileSelected={setFile} />
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Grade &amp; Route Item
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {grade ? (
            <GradeResult result={grade} />
          ) : (
            <Card className="flex h-full items-center justify-center p-10 text-center text-sm text-muted-foreground">
              Grade results will appear here after analysis.
            </Card>
          )}
        </div>
      </div>

      {paths && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Recommended routing</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((p) => (
              <Card
                key={p.path}
                className={
                  p.recommended ? "border-primary ring-1 ring-primary" : ""
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">
                      {p.path}
                    </CardTitle>
                    {p.recommended && (
                      <Badge className="gap-1">
                        <Star className="h-3 w-3" /> Best
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{p.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{p.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Recovery</span>
                    <span className="font-medium">
                      ₹{p.estimated_recovery_value.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Green credits</span>
                    <span className="flex items-center gap-1 font-medium text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {p.green_credits_to_issue}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
