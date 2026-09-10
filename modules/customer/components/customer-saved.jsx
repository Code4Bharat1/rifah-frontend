"use client";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { useState, useEffect } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { BusinessCard } from "@shared/components/rifah/business-card";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Button } from "@shared/components/ui/button";
import { useAuth } from "@shared/providers/auth-provider";
import { userApi } from "@shared/lib/api-services";
import { toast } from "sonner";

function SavedPage() {
  const { user, toggleSaveBusiness, refreshUser } = useAuth();
  const rawSaved = user?.savedBusinesses || [];
  const initialSaved = Array.isArray(rawSaved) ? rawSaved.filter(Boolean) : [];
  const [savedItems, setSavedItems] = useState(initialSaved);

  // Sync state whenever user.savedBusinesses updates
  useEffect(() => {
    if (Array.isArray(user?.savedBusinesses)) {
      setSavedItems(user.savedBusinesses.filter(Boolean));
    }
  }, [user?.savedBusinesses]);

  const handleUnsave = async (biz) => {
    const targetId = biz?._id || biz?.id || (typeof biz === "string" ? biz : "");
    if (!targetId) return;

    // Optimistic UI removal
    const previousItems = savedItems;
    setSavedItems((prev) =>
      prev.filter((b) => {
        const bId = typeof b === "object" && b !== null ? (b._id || b.id) : b;
        return bId !== targetId && b?.slug !== biz?.slug;
      })
    );

    try {
      if (typeof toggleSaveBusiness === "function") {
        await toggleSaveBusiness(targetId);
      } else {
        await userApi.toggleSaveBusiness(targetId);
        if (typeof refreshUser === "function") {
          await refreshUser();
        }
      }
      toast.success(`${biz?.name || "Business"} removed from saved`);
    } catch (err) {
      console.error("Failed to unsave business:", err);
      setSavedItems(previousItems);
      toast.error(err?.message || "Failed to remove from saved");
    }
  };

  return (
    <AppShell role="customer" title="Saved businesses" subtitle={`${savedItems.length} shortlisted members`}>
      {savedItems.length === 0 ? (
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
          {savedItems.map((b, idx) => {
            const isObj = typeof b === "object" && b !== null;
            const key = (isObj ? (b._id || b.slug || b.id) : b) || `saved-biz-${idx}`;
            const biz = isObj ? b : { _id: b, name: "Saved business" };
            return (
              <BusinessCard
                key={key}
                business={biz}
                allowUnsave={true}
                onToggleSave={() => handleUnsave(biz)}
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

export { SavedPage as CustomerSaved };
export default SavedPage;
