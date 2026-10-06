"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Layers,
  MapPin,
  Globe,
  Crown,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Package,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { useAuth } from "@shared/providers/auth-provider";
import { userApi } from "@shared/lib/api-services";
import { COUNTRIES } from "@shared/lib/countries";
import { CATEGORIES_DATA } from "@shared/lib/categories-data";
import { INDIAN_STATES_AND_CITIES } from "@shared/lib/indian-states-cities";
import { INTERNATIONAL_COUNTRIES_AND_CITIES } from "@shared/lib/international-countries-cities";
import { toast } from "sonner";
import { cn } from "@shared/lib/utils";

export function UserProfile() {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    category: "",
    subCategory: "",
    country: "India",
    state: "",
    city: "",
    regionType: "national",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const isIntl = user.country && user.country !== "India" && user.country !== "national";
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        businessName: user.businessName || user.organization || "",
        category: user.category || "",
        subCategory: user.subCategory || "",
        country: user.country || (isIntl ? "United Arab Emirates" : "India"),
        state: user.state || "",
        city: user.city || "",
        regionType: isIntl ? "international" : "national",
      });
    }
  }, [user]);

  const indianStates = useMemo(() => Object.keys(INDIAN_STATES_AND_CITIES).sort(), []);
  const indianCities = useMemo(() => {
    if (!form.state || !INDIAN_STATES_AND_CITIES[form.state]) return [];
    const cities = INDIAN_STATES_AND_CITIES[form.state].map((item) =>
      typeof item === "string" ? item : item.city
    );
    return Array.from(new Set(cities)).sort();
  }, [form.state]);

  const internationalCountries = useMemo(() => Object.keys(INTERNATIONAL_COUNTRIES_AND_CITIES).sort(), []);
  const internationalCities = useMemo(() => {
    if (!form.country || !INTERNATIONAL_COUNTRIES_AND_CITIES[form.country]) return [];
    const cities = INTERNATIONAL_COUNTRIES_AND_CITIES[form.country].map((c) =>
      typeof c === "string" ? c : c.city
    );
    return Array.from(new Set(cities)).sort();
  }, [form.country]);

  const categoriesList = useMemo(() => Object.keys(CATEGORIES_DATA).sort(), []);
  const subCategoriesList = useMemo(() => {
    if (!form.category || !CATEGORIES_DATA[form.category]) return [];
    return CATEGORIES_DATA[form.category];
  }, [form.category]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    setSaving(true);
    try {
      await userApi.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        businessName: form.businessName.trim(),
        organization: form.businessName.trim(),
        category: form.category,
        subCategory: form.subCategory,
        country: form.regionType === "national" ? "India" : form.country,
        state: form.regionType === "national" ? form.state : (form.country || "International"),
        city: form.city,
      });

      if (refreshUser) await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      role="user"
      title="Member Profile & Preferences"
      subtitle="Manage your personal details, business presence, and regional location settings."
    >
      <div className="max-w-4xl mx-auto py-6 px-3 sm:px-6 space-y-6">
        {/* Tier Card Mini Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Current Membership</p>
              <h2 className="text-base font-bold">{user?.subscriberTier || user?.membershipPlan || "Tier I (Free)"}</h2>
            </div>
          </div>
          <Button asChild size="sm" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs h-9">
            <Link href="/user/membership">Upgrade Tier Plan</Link>
          </Button>
        </div>

        {/* Catalogue Quick Link Banner */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Product & Service Catalogue</p>
              <h2 className="text-sm font-bold text-slate-900">List and showcase your business products and services</h2>
            </div>
          </div>
          <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 shrink-0">
            <Link href="/user/catalogue">
              <Package className="h-3.5 w-3.5 mr-1.5" />
              <span>Manage Catalogue</span>
            </Link>
          </Button>
        </div>

        {/* Profile Edit Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Personal info */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-blue-600" />
                <span>Personal Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-11 rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Email Address (Read-only)</Label>
                  <Input
                    value={form.email}
                    disabled
                    className="h-11 rounded-xl text-sm bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Phone Number</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="h-11 rounded-xl text-sm"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Business & Industry */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Business & Industry Specialization</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Business / Enterprise Name</Label>
                  <Input
                    value={form.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                    className="h-11 rounded-xl text-sm"
                    placeholder="e.g. Apex Global Trading"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Industry Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const c = e.target.value;
                      setForm((prev) => ({ ...prev, category: c, subCategory: "" }));
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Primary Category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Sub-Category</Label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => handleChange("subCategory", e.target.value)}
                    disabled={!form.category}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">{form.category ? "Select Sub-Category" : "Choose category first"}</option>
                    {subCategoriesList.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Location (National vs International) */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Geographical Location</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleChange("regionType", "national")}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all",
                    form.regionType === "national"
                      ? "bg-white border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>National (India)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("regionType", "international")}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all",
                    form.regionType === "international"
                      ? "bg-white border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  )}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>International (Global)</span>
                </button>
              </div>

              {form.regionType === "national" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">State</Label>
                    <select
                      value={form.state}
                      onChange={(e) => {
                        const s = e.target.value;
                        setForm((prev) => ({ ...prev, state: s, city: "" }));
                      }}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">City</Label>
                    <select
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      disabled={!form.state}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">{form.state ? "Select City" : "Choose state first"}</option>
                      {indianCities.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Country</Label>
                    <select
                      value={form.country}
                      onChange={(e) => {
                        const c = e.target.value;
                        setForm((prev) => ({ ...prev, country: c, city: "" }));
                      }}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select Country</option>
                      {internationalCountries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">City</Label>
                    <select
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      disabled={!form.country}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">{form.country ? "Select City" : "Choose country first"}</option>
                      {internationalCities.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
