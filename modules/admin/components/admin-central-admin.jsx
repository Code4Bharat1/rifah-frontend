"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Crown, ShieldCheck, Mail, Loader2, ArrowRightLeft } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { useCurrentCentralAdmin, useBusinesses } from "@shared/hooks/use-rifah-api";
import { centralAdminApi } from "@shared/lib/api-services";

function AdminCentralAdmin() {
  const { data: currentAdmin, isLoading, refetch } = useCurrentCentralAdmin();

  const { data: businessesData } = useBusinesses({ limit: 150 });
  const rawBusinesses = Array.isArray(businessesData)
    ? businessesData
    : (businessesData?.businesses || businessesData?.data || []);

  const isEligibleBusiness = (b) =>
    b.isPaid === true &&
    b.membership &&
    b.membership !== "Free" &&
    ["verified", "Verified", "approved", "Approved"].includes(b.verification) &&
    String(b.owner?._id || b.owner) !== String(currentAdmin?._id);

  const eligibleBusinesses = rawBusinesses.filter(isEligibleBusiness);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransfer = async () => {
    if (!selectedBusinessId) {
      toast.error("Please select a business to transfer Central Admin to.");
      return;
    }
    setIsSubmitting(true);
    try {
      await centralAdminApi.transfer(selectedBusinessId);
      toast.success("Central Admin transferred successfully");
      setIsTransferOpen(false);
      setSelectedBusinessId("");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to transfer Central Admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Central Admin"
      subtitle="RIFAH has exactly one Central Admin at a time — transfer it only to a paid, verified business owner"
      actions={
        <Button onClick={() => setIsTransferOpen(true)}>
          <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Central Admin
        </Button>
      }
    >
      <div className="space-y-4">
        <Panel title="Current Central Admin">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
            </div>
          ) : currentAdmin ? (
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <Crown className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-semibold">{currentAdmin.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {currentAdmin.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No Central Admin found.</p>
          )}
        </Panel>

        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="font-semibold text-sm flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Only one Central Admin at a time
          </p>
          <p className="mt-1 text-blue-800/90 dark:text-blue-300">
            Transferring the role hands full central authority to the selected business owner and demotes the
            current Central Admin back to a regular business owner. Only businesses with an active paid
            membership and verified status are eligible.
          </p>
        </div>
      </div>

      <Dialog
        open={isTransferOpen}
        onOpenChange={(open) => {
          setIsTransferOpen(open);
          if (!open) setSelectedBusinessId("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Central Admin</DialogTitle>
            <DialogDescription>
              Select a paid, verified business owner to become the new Central Admin. The current Central Admin
              will be demoted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="central-admin-biz">Select Business Owner *</Label>
            <Select value={selectedBusinessId || undefined} onValueChange={setSelectedBusinessId}>
              <SelectTrigger id="central-admin-biz" className="w-full">
                <SelectValue placeholder="Choose a paid, verified business owner..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {eligibleBusinesses.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No paid & verified businesses found yet.
                  </div>
                )}
                {eligibleBusinesses.map((b) => {
                  const oName = b.owner?.name || b.contactPerson || b.name;
                  const oEmail = b.owner?.email || b.ownerEmail || b.email || "No email";
                  return (
                    <SelectItem key={b._id} value={b._id}>
                      <div className="flex flex-col text-left py-0.5">
                        <span className="font-medium text-xs text-foreground">{oName} ({b.name})</span>
                        <span className="text-[11px] text-muted-foreground">{oEmail}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Only businesses with an active paid membership and verified status appear here.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={isSubmitting || !selectedBusinessId}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminCentralAdmin };
export default AdminCentralAdmin;
