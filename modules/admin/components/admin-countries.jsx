"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MapPinned,
  Plus,
  Trash2,
  Loader2,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { countryApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { useBusinesses } from "@shared/hooks/use-rifah-api";

const emptyForm = { name: "", code: "" };
const emptyAssignForm = {
  countryName: "",
  businessId: "",
  name: "",
  email: "",
};

export function AdminCountries() {
  const { user } = useAuth();
  const isCentralAdmin = user?.role === "central_admin";
  const { data: businessesData } = useBusinesses({ limit: 200 });
  const rawBusinesses = Array.isArray(businessesData)
    ? businessesData
    : businessesData?.businesses || businessesData?.data || [];
  const eligibleBusinesses = rawBusinesses.filter((business) => {
    const hasOwner = Boolean(
      business?.owner || business?.contactPerson || business?.email,
    );
    const isPaid =
      business?.isPaid === true ||
      business?.membership === "Paid" ||
      business?.membership === "Premium";
    return hasOwner && isPaid;
  });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [assignForm, setAssignForm] = useState(emptyAssignForm);

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await countryApi.list();
      const rows = Array.isArray(res) ? res : res?.countries || res?.data || [];
      setCountries(rows);
    } catch (error) {
      toast.error(error.message || "Unable to load countries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isCentralAdmin) {
      return;
    }

    const timer = setTimeout(() => {
      void fetchCountries();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCountries, isCentralAdmin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Country name is required.");
      return;
    }
    if (!form.code.trim()) {
      toast.error("Country code is required.");
      return;
    }

    try {
      setSaving(true);
      await countryApi.create({
        name: form.name.trim(),
        code: form.code.trim(),
      });
      toast.success("Country created successfully");
      setForm(emptyForm);
      fetchCountries();
    } catch (error) {
      toast.error(error.message || "Failed to create country");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignAdmin = async (event) => {
    event.preventDefault();
    if (!assignForm.countryName.trim()) {
      toast.error("Please select a country to assign the admin to.");
      return;
    }

    const hasBusinessSelection = Boolean(assignForm.businessId);
    const hasManualContact = Boolean(
      assignForm.name.trim() || assignForm.email.trim(),
    );

    if (!hasBusinessSelection && !hasManualContact) {
      toast.error(
        "Select a business or provide a business owner name and email to assign the admin.",
      );
      return;
    }

    try {
      setAssigning(true);
      await countryApi.assignAdmin({
        countryName: assignForm.countryName.trim(),
        businessId: assignForm.businessId || undefined,
        name: assignForm.name.trim(),
        email: assignForm.email.trim(),
      });
      toast.success("Country admin assigned successfully");
      setAssignForm(emptyAssignForm);
      fetchCountries();
    } catch (error) {
      toast.error(error.message || "Failed to assign country admin");
    } finally {
      setAssigning(false);
    }
  };

  const handleSelectBusiness = (businessId) => {
    const selectedBusiness = rawBusinesses.find(
      (business) =>
        String(business?._id || business?.id) === String(businessId),
    );

    setAssignForm((current) => ({
      ...current,
      businessId: businessId || "",
      name:
        selectedBusiness?.owner?.name ||
        selectedBusiness?.contactPerson ||
        selectedBusiness?.name ||
        current.name,
      email:
        selectedBusiness?.owner?.email ||
        selectedBusiness?.ownerEmail ||
        selectedBusiness?.email ||
        current.email,
    }));
  };

  const handleDelete = async (countryId, countryName) => {
    if (
      !confirm(
        `Delete ${countryName}? This will detach it from any chapter assignment.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(countryId);
      await countryApi.delete(countryId);
      toast.success(`${countryName} deleted`);
      fetchCountries();
    } catch (error) {
      toast.error(error.message || "Failed to delete country");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isCentralAdmin) {
    return (
      <AppShell role="admin" title="Countries" subtitle="Central Admin only">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          You do not have permission to manage countries.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="admin"
      title="Country Management"
      subtitle="Add countries to structure chapters and regional filters"
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Panel title="Add country" icon={MapPinned}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country-name">Country name</Label>
                <Input
                  id="country-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="India"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country-code">Country code</Label>
                <Input
                  id="country-code"
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="IN"
                  maxLength={3}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Create country"}
              </Button>
            </form>
          </Panel>

          <Panel title="Assign country admin" icon={UserCog}>
            <form onSubmit={handleAssignAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assign-country-name">Country</Label>
                <select
                  id="assign-country-name"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  value={assignForm.countryName}
                  onChange={(event) =>
                    setAssignForm((current) => ({
                      ...current,
                      countryName: event.target.value,
                    }))
                  }
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option
                      key={country._id || country.id}
                      value={country.name}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country-admin-business">Business</Label>
                <select
                  id="country-admin-business"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  value={assignForm.businessId}
                  onChange={(event) => handleSelectBusiness(event.target.value)}
                >
                  <option value="">Select a business</option>
                  {eligibleBusinesses.map((business) => {
                    const ownerName =
                      business?.owner?.name ||
                      business?.contactPerson ||
                      business?.name ||
                      "Business owner";
                    const businessName = business?.name || "Unnamed business";

                    return (
                      <option
                        key={business?._id || business?.id}
                        value={business?._id || business?.id}
                      >
                        {ownerName} — {businessName}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-500">
                  Choose a paid business owner from the list, or leave it blank
                  and enter a manual name/email below.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country-admin-name">Admin name</Label>
                <Input
                  id="country-admin-name"
                  value={assignForm.name}
                  onChange={(event) =>
                    setAssignForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country-admin-email">Admin email</Label>
                <Input
                  id="country-admin-email"
                  type="email"
                  value={assignForm.email}
                  onChange={(event) =>
                    setAssignForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="admin@example.com"
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={assigning}
              >
                {assigning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCog className="h-4 w-4" />
                )}
                {assigning ? "Assigning..." : "Assign country admin"}
              </Button>
            </form>
          </Panel>
        </div>

        <Panel title="Countries" icon={ShieldCheck}>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading countries...
            </div>
          ) : countries.length === 0 ? (
            <div className="text-sm text-slate-500">
              No countries created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {countries.map((country) => (
                <div
                  key={country._id || country.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {country.name}
                    </div>
                    <div className="text-sm text-slate-500">{country.code}</div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    disabled={deletingId === (country._id || country.id)}
                    onClick={() =>
                      handleDelete(country._id || country.id, country.name)
                    }
                  >
                    {deletingId === (country._id || country.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
