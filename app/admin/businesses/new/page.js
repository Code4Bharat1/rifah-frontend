"use client";

import { AppShell } from "@shared/components/rifah/app-shell";
import { RegisterBusinessPage } from "@modules/auth/components/register-business-page";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@shared/components/ui/button";

export default function AdminAddBusinessPage() {
  return (
    <AppShell
      role="admin"
      title="Register New Business"
      headerAction={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/businesses">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Businesses
          </Link>
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto border bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm my-6">
        <RegisterBusinessPage isAdmin={true} />
      </div>
    </AppShell>
  );
}
