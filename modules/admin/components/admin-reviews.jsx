"use client";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";

export function AdminReviews() {
  return (
    <AppShell
      role="admin"
      title="Reviews Policy"
      subtitle="Review management is exclusively handled by business owners"
    >
      <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12 text-center max-w-xl mx-auto my-10 shadow-xs">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Direct Reviews & Business Ownership</h3>
        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
          Admin moderation is disabled. Customer and member reviews are published live directly upon submission with no approval gate.
        </p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Reviews are managed and deleted exclusively by each respective <strong>Business Owner</strong> from their business workspace.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild variant="default" className="rounded-xl">
            <Link href="/admin">Back to Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

export default AdminReviews;
