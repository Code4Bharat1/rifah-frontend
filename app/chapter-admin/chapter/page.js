"use client";

import { Loader2 } from "lucide-react";
import AdminChapterDetails from "@modules/admin/components/admin-chapter-details";
import { AppShell } from "@shared/components/rifah/app-shell";
import { useAuth } from "@shared/providers/auth-provider";

export default function ChapterAdminMyChapterPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppShell role="admin" title="My Chapter">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!user?.chapterId) {
    return (
      <AppShell role="admin" title="My Chapter">
        <div className="text-center py-20">
          <p className="text-muted-foreground">No chapter is assigned to your account yet. Contact RIFAH Head Office.</p>
        </div>
      </AppShell>
    );
  }

  return <AdminChapterDetails chapterId={user.chapterId} />;
}
