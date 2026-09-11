"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, Search } from "lucide-react";
import { Button } from "@shared/components/ui/button";

export default function GlobalErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("Next.js Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-5 bg-card border border-border/80 rounded-3xl p-8 shadow-xl shadow-slate-900/5">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested page encountered a temporary issue. You can reload the page or return to the directory.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold text-xs h-9 px-4 gap-1.5 shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try Again
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto text-xs h-9 px-4 font-semibold gap-1.5"
          >
            <Link href="/discover">
              <Search className="h-3.5 w-3.5" /> Browse Directory
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full sm:w-auto text-xs h-9 px-3 font-semibold text-muted-foreground gap-1.5"
          >
            <Link href="/">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
