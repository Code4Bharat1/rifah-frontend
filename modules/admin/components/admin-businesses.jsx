"use client";
import Link from "next/link";
import { Building2, Search, ExternalLink, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@shared/components/ui/select";
import { useBusinesses, useCategories } from "@shared/hooks/use-rifah-api";
import { businessApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { useAuth } from "@shared/providers/auth-provider";

function AdminBusinesses() {
  const { user } = useAuth();
  const basePath = user?.role === "chapter_admin" ? "/chapter-admin" : user?.role === "state_admin" ? "/state-admin" : "/admin";
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("all");
  const [statusTargetBusiness, setStatusTargetBusiness] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  
  const { data: businessesData, refetch } = useBusinesses({ 
    search: q || undefined,
    industry: industry === "all" ? undefined : industry 
  });
  const rows = Array.isArray(businessesData) ? businessesData : [];

  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const mainCategories = categories.filter(c => !c.parent);
  const subCategories = categories.filter(c => c.parent);

  const handleConfirmToggleStatus = async () => {
    if (!statusTargetBusiness) return;
    const b = statusTargetBusiness;
    const newStatus = b.status === "active" ? "suspended" : "active";
    try {
      setIsStatusUpdating(true);
      await businessApi.updateStatus(b._id, { status: newStatus });
      toast.success(`Business ${newStatus === "active" ? "activated" : "suspended"} successfully`);
      setStatusTargetBusiness(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update business status.");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Member businesses"
      subtitle={`${rows.length} listed businesses`}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full">Export directory</Button>
          {(user?.role === "central_admin" || user?.role === "super_admin") && (
            <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700">
              <Link href={`${basePath}/businesses/new`}>Add Business</Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, industry, city or chapter"
              className="h-11 pl-10"
            />
          </div>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="h-11 sm:w-[220px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {mainCategories.length > 0 ? (
                mainCategories.map(mc => {
                  const subs = subCategories.filter(sc => sc.parent === mc.name);
                  return (
                    <SelectGroup key={mc.name}>
                      <SelectLabel className="font-semibold text-primary">{mc.name}</SelectLabel>
                      <SelectItem value={mc.name} className="italic text-muted-foreground ml-2">General {mc.name}</SelectItem>
                      {subs.map(sc => (
                        <SelectItem key={sc.name} value={sc.name} className="ml-4">{sc.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })
              ) : null}
            </SelectContent>
          </Select>
        </div>

        <Panel>
          <ResponsiveTable
            rows={rows}
            empty={<EmptyState icon={Building2} title="No businesses match" description="Try a different search term." />}
            columns={[
              { key: "name", header: "BUSINESS", cell: (r) => <span className="font-semibold text-sm">{r.name}</span> },
              { key: "industry", header: "INDUSTRY", cell: (r) => r.industry },
              { key: "city", header: "LOCATION", cell: (r) => `${r.city}, ${r.state}` },
              { key: "chapter", header: "CHAPTER", cell: (r) => r.chapter },
              { key: "plan", header: "PLAN", cell: (r) => <MembershipBadge tier={r.membership} /> },
              { key: "ver", header: "VERIFICATION", cell: (r) => <VerificationBadge status={r.verification} compact /> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Link href={`${basePath}/businesses/${r._id}`} className="text-sm font-medium text-primary hover:underline">
                    View
                  </Link>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.industry} · {r.city}
                    </p>
                  </div>
                  <VerificationBadge status={r.verification} compact />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <MembershipBadge tier={r.membership} />
                  <Pill>{r.chapter}</Pill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${basePath}/businesses/${r._id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatusTargetBusiness(r)}>
                    {r.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                </div>
              </div>
            )}
          />
        </Panel>
      </div>

      {/* Suspend / Activate Confirmation Alert Dialog */}
      <AlertDialog open={!!statusTargetBusiness} onOpenChange={(open) => !open && setStatusTargetBusiness(null)}>
        <AlertDialogContent className="sm:max-w-[440px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${statusTargetBusiness?.status === "active" ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"}`}>
                {statusTargetBusiness?.status === "active" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <AlertDialogTitle className="text-lg font-bold">
                {statusTargetBusiness?.status === "active" ? "Suspend Business" : "Activate Business"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
              {statusTargetBusiness?.status === "active" ? (
                <>
                  Are you sure you want to suspend <strong className="text-foreground">{statusTargetBusiness?.name}</strong>? 
                  Once suspended, this business will not be visible to members or publicly listed in the directory.
                </>
              ) : (
                <>
                  Are you sure you want to activate <strong className="text-foreground">{statusTargetBusiness?.name}</strong>? 
                  Once activated, this business will be restored and listed publicly in the directory.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isStatusUpdating} onClick={() => setStatusTargetBusiness(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isStatusUpdating}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmToggleStatus();
              }}
              className={statusTargetBusiness?.status === "active" 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"}
            >
              {isStatusUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isStatusUpdating 
                ? (statusTargetBusiness?.status === "active" ? "Suspending..." : "Activating...") 
                : (statusTargetBusiness?.status === "active" ? "Yes, Suspend" : "Yes, Activate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export { AdminBusinesses };
export default AdminBusinesses;
