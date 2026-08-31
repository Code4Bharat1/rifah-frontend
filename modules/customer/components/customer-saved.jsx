"use client";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { BusinessCard } from "@shared/components/rifah/business-card";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Button } from "@shared/components/ui/button";
import { businesses, savedBusinessIds } from "@shared/lib/mock-data";

function SavedPage() {
  const saved = businesses.filter((b) => savedBusinessIds.includes(b.id));

  return (
    <AppShell role="customer" title="Saved businesses" subtitle={`${saved.length} shortlisted members`}>
      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Save members from the directory to compare them later."
          action={
            <Button asChild>
              <Link href="/discover">Browse directory</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {saved.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </AppShell>
  );
}


const CustomerSaved = SavedPage;

export { CustomerSaved };
export default CustomerSaved;
