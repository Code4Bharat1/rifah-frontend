"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MapPinned,
  Plus,
  Trash2,
  Loader2,
  ShieldCheck,
  UserCog,
  Globe2,
  Users,
  Building2,
  Layers,
  MapPin,
  Mail,
  Phone,
  UserX,
  AlertCircle,
  CheckCircle2,
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
  const isSuperCentralAdmin =
    user?.role === "central_admin" ||
    user?.role === "super_admin" ||
    user?.role === "secretariat";

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
  const [removingAdminCountry, setRemovingAdminCountry] = useState(null);
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
    if (!isSuperCentralAdmin) {
      return;
    }

    const timer = setTimeout(() => {
      void fetchCountries();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCountries, isSuperCentralAdmin]);

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
        code: form.code.trim().toUpperCase(),
      });
      toast.success(`${form.name.trim()} created successfully`);
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
        "Select a business owner or enter a name and email to assign the admin.",
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
      toast.success(
        `Country admin assigned to ${assignForm.countryName.trim()} successfully!`,
      );
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

  const handleQuickReassign = (countryName) => {
    setAssignForm((current) => ({
      ...current,
      countryName,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveAdmin = async (countryName) => {
    if (
      !confirm(
        `Are you sure you want to revoke the Country Admin for ${countryName}? They will revert to their previous role.`,
      )
    ) {
      return;
    }

    try {
      setRemovingAdminCountry(countryName);
      await countryApi.removeAdmin(countryName);
      toast.success(`Country admin for ${countryName} revoked`);
      fetchCountries();
    } catch (error) {
      toast.error(error.message || "Failed to remove country admin");
    } finally {
      setRemovingAdminCountry(null);
    }
  };

  const handleDelete = async (countryId, countryName) => {
    if (
      !confirm(
        `Delete ${countryName}? This action cannot be undone and will only succeed if no states or chapters are assigned.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(countryId);
      await countryApi.delete(countryId);
      toast.success(`${countryName} deleted successfully`);
      fetchCountries();
    } catch (error) {
      toast.error(error.message || "Failed to delete country");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isSuperCentralAdmin) {
    return (
      <AppShell
        role="admin"
        title="Countries"
        subtitle="Global Super Central Admin exclusive"
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-xs">
          <div className="flex items-center gap-3 font-semibold text-amber-950">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span>Country Module Access Restricted</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-amber-800">
            The Country Module is reserved exclusively for the Global Super
            Central Admin. Country Central Admins govern within their own
            assigned national boundaries and do not have access to global
            country creation or administration.
          </p>
        </div>
      </AppShell>
    );
  }

  const totalCountries = countries.length;
  const assignedCountries = countries.filter((c) => Boolean(c.assignedAdmin)).length;
  const totalChapters = countries.reduce(
    (acc, c) => acc + (c.chaptersCount || 0),
    0,
  );
  const totalBusinesses = countries.reduce(
    (acc, c) => acc + (c.businessesCount || 0),
    0,
  );

  return (
    <AppShell
      role="admin"
      title="Global Country Management Hub"
      subtitle="Exclusive master hub for creating country platforms and appointing national leaders"
    >
      <div className="space-y-6">
        {/* KPI Banner */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Total Countries
              </span>
              <Globe2 className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {totalCountries}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Admin Appointed
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {assignedCountries} / {totalCountries}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Global Chapters
              </span>
              <Layers className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {totalChapters}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Global Businesses
              </span>
              <Building2 className="h-4 w-4 text-violet-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {totalBusinesses}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Left Column: Create Country & Assign Admin */}
          <div className="space-y-6">
            {/* Simple 2-field Country Creation */}
            <Panel title="Add new country" icon={MapPinned}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country-name">
                    Country name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. United Arab Emirates"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country-code">
                    Country code (ISO 2–3) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country-code"
                    value={form.code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        code: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. AE or IN"
                    maxLength={3}
                  />
                  <p className="text-[11px] text-slate-500">
                    2 to 3 uppercase letters (e.g. IN, AE, US, UK).
                  </p>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {saving ? "Creating platform..." : "Create country platform"}
                </Button>
              </form>
            </Panel>

            {/* Assign Country Admin */}
            <Panel title="Appoint country admin" icon={UserCog}>
              <form onSubmit={handleAssignAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assign-country-name">
                    Select country <span className="text-red-500">*</span>
                  </Label>
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
                    <option value="">Choose country</option>
                    {countries.map((country) => (
                      <option
                        key={country._id || country.id}
                        value={country.name}
                      >
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country-admin-business">
                    Appoint from verified business
                  </Label>
                  <select
                    id="country-admin-business"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    value={assignForm.businessId}
                    onChange={(event) => handleSelectBusiness(event.target.value)}
                  >
                    <option value="">Select a verified business owner</option>
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
                    Pick an existing verified business owner or enter credentials below.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country-admin-name">Admin full name</Label>
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
                    placeholder="admin@rifah.org"
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

          {/* Right Column: Country Management Grid Cards */}
          <Panel title="Active Country Platforms" icon={ShieldCheck}>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-500 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Loading country platforms...</span>
              </div>
            ) : countries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No countries created yet. Use the form on the left to add your first national chamber platform.
              </div>
            ) : (
              <div className="space-y-4">
                {countries.map((country) => {
                  const admin = country.assignedAdmin;
                  const isDeleting =
                    deletingId === (country._id || country.id);
                  const isRemovingAdmin =
                    removingAdminCountry === country.name;

                  return (
                    <div
                      key={country._id || country.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300"
                    >
                      {/* Country Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                            {country.code || "GL"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 text-base">
                                {country.name}
                              </h3>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                {country.code}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              Status: {country.status || "Active"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1.5"
                            onClick={() => handleQuickReassign(country.name)}
                          >
                            <UserCog className="h-3.5 w-3.5" />
                            {admin ? "Reassign" : "Appoint Admin"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="text-xs gap-1.5"
                            disabled={isDeleting}
                            onClick={() =>
                              handleDelete(
                                country._id || country.id,
                                country.name,
                              )
                            }
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Live Footprint Stats */}
                      <div className="grid grid-cols-2 gap-2 py-3 sm:grid-cols-4">
                        <div className="rounded-lg bg-slate-50 p-2 text-center">
                          <span className="text-[11px] font-medium text-slate-500 uppercase">
                            States
                          </span>
                          <div className="text-base font-bold text-slate-800">
                            {country.statesCount || 0}
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-2 text-center">
                          <span className="text-[11px] font-medium text-slate-500 uppercase">
                            Chapters
                          </span>
                          <div className="text-base font-bold text-slate-800">
                            {country.chaptersCount || 0}
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-2 text-center">
                          <span className="text-[11px] font-medium text-slate-500 uppercase">
                            Businesses
                          </span>
                          <div className="text-base font-bold text-slate-800">
                            {country.businessesCount || 0}
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-2 text-center">
                          <span className="text-[11px] font-medium text-slate-500 uppercase">
                            Members
                          </span>
                          <div className="text-base font-bold text-slate-800">
                            {country.membersCount || 0}
                          </div>
                        </div>
                      </div>

                      {/* Assigned Admin Profile Strip */}
                      <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                        {admin ? (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-2xs">
                                {admin.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase() || "CA"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-900 text-sm">
                                    {admin.name}
                                  </span>
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    Country Admin
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                                  {admin.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {admin.email}
                                    </span>
                                  )}
                                  {admin.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {admin.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-8 gap-1.5"
                              disabled={isRemovingAdmin}
                              onClick={() => handleRemoveAdmin(country.name)}
                            >
                              {isRemovingAdmin ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserX className="h-3.5 w-3.5" />
                              )}
                              Revoke
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 text-xs text-amber-800">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                              <span>
                                No Country Admin appointed yet. This nation's
                                platform is unmanaged.
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="text-xs font-semibold text-primary h-auto p-0"
                              onClick={() => handleQuickReassign(country.name)}
                            >
                              Appoint now →
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
