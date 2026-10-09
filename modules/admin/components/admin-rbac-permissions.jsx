"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Check,
  Search,
  Radio,
  Sparkles,
  Users,
  Building2,
  CalendarDays,
  Compass,
  TrendingUp,
  FileStack,
  MessageSquareText,
  Megaphone,
  BarChart3,
  ScrollText,
  Settings,
  GraduationCap,
  Award,
  Layers,
  MapPin,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { rolePermissionTemplateApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";

// Fixed Chamber Leadership Roles - No custom role creation allowed
export const LEADER_ROLES = [
  "Chairman",
  "Co-Founder",
  "President",
  "Vice President",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Director",
  "Executive Member",
  "Board Member",
  "Advisor",
  "Other",
];

// Available sidebar features by hierarchy level
const SIDEBAR_FEATURES_BY_LEVEL = {
  Chapter: [
    {
      category: "Overview & Operations",
      items: [
        { route: "/chapter-admin", label: "Dashboard Overview", icon: Radio, desc: "Main chapter dashboard desk" },
        { route: "/chapter-admin/operations", label: "Event Operations Center", icon: Radio, desc: "Live event operations desk" },
        { route: "/chapter-admin/live-control", label: "Live Event Control Desk", icon: Sparkles, desc: "Meeting timer & live controls" },
      ],
    },
    {
      category: "Members & Directory",
      items: [
        { route: "/chapter-admin/members", label: "Chapter Members", icon: Users, desc: "Member directory and profiles" },
        { route: "/chapter-admin/businesses", label: "Chapter Businesses", icon: Building2, desc: "Businesses in this chapter" },
        { route: "/chapter-admin/verification", label: "Verifications", icon: ShieldCheck, desc: "Review and approve verifications" },
      ],
    },
    {
      category: "Events & Engagement",
      items: [
        { route: "/chapter-admin/events", label: "Events & Meetings", icon: CalendarDays, desc: "Create and manage chapter events" },
        { route: "/chapter-admin/feeds", label: "Feeds & Community", icon: Compass, desc: "Posts and community updates" },
        { route: "/chapter-admin/networking-analytics", label: "Business Analytics", icon: TrendingUp, desc: "1-to-1s, referrals and metrics" },
        { route: "/chapter-admin/enquiries", label: "Enquiries & Asks", icon: FileStack, desc: "Track member enquiries" },
        { route: "/chapter-admin/queries", label: "Member Support Queries", icon: MessageSquareText, desc: "Handle chapter questions" },
      ],
    },
    {
      category: "Administration & Content",
      items: [
        { route: "/chapter-admin/advertisements", label: "Advertisements", icon: Megaphone, desc: "Banners and sponsor ads" },
        { route: "/chapter-admin/reports", label: "Reports & Exports", icon: BarChart3, desc: "Generate chapter activity reports" },
        { route: "/chapter-admin/audit", label: "Audit Logs", icon: ScrollText, desc: "View administrative activity logs" },
        { route: "/chapter-admin/lms", label: "LMS Learning Desk", icon: GraduationCap, desc: "Access chamber training courses" },
        { route: "/chapter-admin/settings", label: "Chapter Settings", icon: Settings, desc: "Configure chapter parameters" },
      ],
    },
  ],
  State: [
    {
      category: "Overview & Operations",
      items: [
        { route: "/state-admin", label: "State Dashboard", icon: Radio, desc: "State overview executive dashboard" },
        { route: "/state-admin/operations", label: "Operations Center", icon: Radio, desc: "State-level event operations desk" },
      ],
    },
    {
      category: "Chapters & Members",
      items: [
        { route: "/state-admin/chapters", label: "State Chapters", icon: MapPin, desc: "Manage chapters in state" },
        { route: "/state-admin/members", label: "State Members", icon: Users, desc: "All members in jurisdiction" },
        { route: "/state-admin/businesses", label: "State Businesses", icon: Building2, desc: "All businesses registered in state" },
      ],
    },
    {
      category: "Activities & Analytics",
      items: [
        { route: "/state-admin/events", label: "State Events", icon: CalendarDays, desc: "Conclaves and state summits" },
        { route: "/state-admin/feeds", label: "Community Feeds", icon: Compass, desc: "State-wide feeds and notices" },
        { route: "/state-admin/networking-analytics", label: "Networking Analytics", icon: TrendingUp, desc: "State performance analytics" },
        { route: "/state-admin/enquiries", label: "State Enquiries", icon: FileStack, desc: "State-level commercial leads" },
      ],
    },
    {
      category: "Reporting & Governance",
      items: [
        { route: "/state-admin/advertisements", label: "Advertisements", icon: Megaphone, desc: "State banners and campaigns" },
        { route: "/state-admin/reports", label: "Reports & Data", icon: BarChart3, desc: "State reports and CSV exports" },
        { route: "/state-admin/audit", label: "Audit Logs", icon: ScrollText, desc: "State administrative audit logs" },
        { route: "/state-admin/lms", label: "State LMS", icon: GraduationCap, desc: "State learning courses" },
        { route: "/state-admin/settings", label: "State Settings", icon: Settings, desc: "State configuration settings" },
      ],
    },
  ],
  Central: [
    {
      category: "Overview & Operations",
      items: [
        { route: "/admin", label: "Central Dashboard", icon: Radio, desc: "National chamber executive dashboard" },
        { route: "/admin/operations", label: "Operations Center", icon: Radio, desc: "National event operations center" },
      ],
    },
    {
      category: "Enterprise & Governance",
      items: [
        { route: "/admin/businesses", label: "Businesses Directory", icon: Building2, desc: "Manage all national businesses" },
        { route: "/admin/users", label: "User Management", icon: Users, desc: "All system accounts and roles" },
        { route: "/admin/states", label: "State Chapters", icon: MapPin, desc: "Manage states and territorial divisions" },
        { route: "/admin/chapters", label: "Chapter Desks", icon: Layers, desc: "National chapter directory" },
        { route: "/admin/central-admin", label: "Central Administration", icon: ShieldCheck, desc: "Core chamber administration" },
      ],
    },
    {
      category: "Events & Commerce",
      items: [
        { route: "/admin/events", label: "National Events", icon: CalendarDays, desc: "Conferences and mega conclaves" },
        { route: "/admin/payments", label: "Financial Payments", icon: BarChart3, desc: "Payment records and transactions" },
        { route: "/admin/memberships", label: "Memberships Plans", icon: Award, desc: "Tier definitions and subscriptions" },
        { route: "/admin/feeds", label: "National Feeds", icon: Compass, desc: "Global feed curation and moderation" },
        { route: "/admin/enquiries", label: "National Enquiries", icon: FileStack, desc: "Pan-India trade inquiries" },
      ],
    },
    {
      category: "Reporting & System",
      items: [
        { route: "/admin/advertisements", label: "Advertisements", icon: Megaphone, desc: "Commercial sponsorships" },
        { route: "/admin/reports", label: "National Reports", icon: BarChart3, desc: "Executive reports and analytics" },
        { route: "/admin/audit", label: "System Audit Logs", icon: ScrollText, desc: "Immutable security audit log" },
        { route: "/admin/roles", label: "Roles & RBAC Management", icon: Award, desc: "Hierarchy permissions and leadership" },
        { route: "/admin/lms", label: "LMS Academy", icon: GraduationCap, desc: "National training center" },
        { route: "/admin/settings", label: "Global Settings", icon: Settings, desc: "System-wide parameters" },
      ],
    },
  ],
};

// Core functional permissions
const FUNCTIONAL_PERMISSIONS = [
  { id: "event:manage", label: "Event Management", desc: "Create, edit, and publish meetings and events" },
  { id: "attendance:mark", label: "Mark Attendance", desc: "Scan QR codes and record meeting attendance" },
  { id: "members:view", label: "View Members List", desc: "Browse member profiles and contact details" },
  { id: "members:verify", label: "Verify Businesses", desc: "Review documents and approve chapter verification" },
  { id: "reports:read", label: "View & Export Reports", desc: "Download attendance sheets and performance CSVs" },
  { id: "feeds:manage", label: "Community Moderation", desc: "Post announcements and moderate feed discussions" },
  { id: "enquiries:manage", label: "Trade Enquiries Desk", desc: "Route and respond to business trade requests" },
  { id: "settings:manage", label: "Administrative Controls", desc: "Modify local chapter configuration and details" },
];

export function AdminRbacPermissions({ onAssignTemplate }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isChapterAdmin = user?.role === "chapter_admin";
  const isStateAdmin = user?.role === "state_admin";
  const isCentralAdmin = ["central_admin", "super_admin", "admin", "secretariat"].includes(user?.role);

  // Selected hierarchy level
  const defaultLevel = isChapterAdmin ? "Chapter" : isStateAdmin ? "State" : "Chapter";
  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(null); // The role being edited from LEADER_ROLES
  const [formData, setFormData] = useState({
    permissions: [],
    allowedNavRoutes: [],
    description: "",
  });

  // Fetch all templates
  const { data: templatesRes, isLoading: loadingTemplates } = useQuery({
    queryKey: ["rbac-templates"],
    queryFn: () => rolePermissionTemplateApi.getAll(),
  });

  const rawTemplates = templatesRes?.data || templatesRes || [];
  const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

  // Mutation to save permissions for a role
  const saveMutation = useMutation({
    mutationFn: (payload) => rolePermissionTemplateApi.create(payload),
    onSuccess: (data) => {
      toast.success(`Permissions for ${selectedLevel} ${activeRole} saved successfully`);
      queryClient.invalidateQueries(["rbac-templates"]);
      queryClient.invalidateQueries(["admin-leaders"]);
      setModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save permissions");
    },
  });

  // Open permission configuration for a specific role
  const handleConfigureRole = (roleName) => {
    setActiveRole(roleName);

    // Find if a template already exists for this role + selectedLevel
    const existing = templates.find(
      (t) => t.name === roleName && t.level === selectedLevel && t.isActive
    );

    const defaultRoutes =
      selectedLevel === "Chapter"
        ? ["/chapter-admin", "/chapter-admin/operations", "/chapter-admin/members", "/chapter-admin/events"]
        : selectedLevel === "State"
          ? ["/state-admin", "/state-admin/operations", "/state-admin/chapters", "/state-admin/events"]
          : ["/admin", "/admin/operations", "/admin/businesses", "/admin/events"];

    if (existing) {
      setFormData({
        permissions: existing.permissions || [],
        allowedNavRoutes: existing.allowedNavRoutes || [],
        description: existing.description || "",
      });
    } else {
      setFormData({
        permissions: ["event:manage", "reports:read", "members:view"],
        allowedNavRoutes: defaultRoutes,
        description: `Permissions assigned to ${selectedLevel} ${roleName}`,
      });
    }

    setModalOpen(true);
  };

  const handleToggleRoute = (route) => {
    setFormData((prev) => {
      const exists = prev.allowedNavRoutes.includes(route);
      return {
        ...prev,
        allowedNavRoutes: exists
          ? prev.allowedNavRoutes.filter((r) => r !== route)
          : [...prev.allowedNavRoutes, route],
      };
    });
  };

  const handleTogglePermission = (permId) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleSelectAllRoutes = () => {
    const categories = SIDEBAR_FEATURES_BY_LEVEL[selectedLevel] || [];
    const allRoutes = categories.flatMap((c) => c.items.map((i) => i.route));
    setFormData((prev) => ({
      ...prev,
      allowedNavRoutes: Array.from(new Set([...prev.allowedNavRoutes, ...allRoutes])),
    }));
  };

  const handleClearAllRoutes = () => {
    setFormData((prev) => ({
      ...prev,
      allowedNavRoutes: [],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeRole) return;

    const payload = {
      name: activeRole,
      level: selectedLevel,
      permissions: formData.permissions,
      allowedNavRoutes: formData.allowedNavRoutes,
      description: formData.description.trim(),
    };

    saveMutation.mutate(payload);
  };

  // Filter roles based on search
  const filteredRoles = LEADER_ROLES.filter((roleName) =>
    search.trim() ? roleName.toLowerCase().includes(search.toLowerCase().trim()) : true
  );

  const featureCategories = SIDEBAR_FEATURES_BY_LEVEL[selectedLevel] || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-foreground">Leadership Role Permissions (RBAC)</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Configure which sidebar navigation features and privileges each leadership role receives.
            When a business owner is assigned one of these roles, their administration panel is strictly tailored to these permissions.
          </p>
        </div>

        {/* Hierarchy Level Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/50 shrink-0">
          {(isCentralAdmin || isChapterAdmin) && (
            <button
              type="button"
              onClick={() => setSelectedLevel("Chapter")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedLevel === "Chapter"
                  ? "bg-background text-foreground shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Chapter Roles
            </button>
          )}

          {(isCentralAdmin || isStateAdmin) && (
            <button
              type="button"
              onClick={() => setSelectedLevel("State")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedLevel === "State"
                  ? "bg-background text-foreground shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              State Roles
            </button>
          )}

          {isCentralAdmin && (
            <button
              type="button"
              onClick={() => setSelectedLevel("Central")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedLevel === "Central"
                  ? "bg-background text-foreground shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Central Roles
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-card border border-border p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Filter ${selectedLevel} roles (e.g. President, Secretary, Treasurer)...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 w-full bg-background border-muted-foreground/20 rounded-xl text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground font-semibold px-2 shrink-0">
          {filteredRoles.length} Roles in {selectedLevel} Hierarchy
        </div>
      </div>

      {/* Fixed Roles Grid */}
      {loadingTemplates ? (
        <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
          <ShieldCheck className="h-8 w-8 animate-pulse text-primary/40" />
          <span>Loading permissions configuration...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((roleName) => {
            const configuredTemplate = templates.find(
              (t) => t.name === roleName && t.level === selectedLevel && t.isActive
            );

            const isConfigured = Boolean(configuredTemplate);
            const routeCount = configuredTemplate?.allowedNavRoutes?.length || 0;
            const permCount = configuredTemplate?.permissions?.length || 0;

            return (
              <div
                key={roleName}
                className="group relative bg-card rounded-3xl border border-border p-5 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors",
                          isConfigured
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-tight">{roleName}</h3>
                        <span className="text-[10px] font-semibold text-muted-foreground block mt-0.5">
                          {selectedLevel} Hierarchy Role
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0",
                        isConfigured
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {isConfigured ? "Configured" : "Default"}
                    </span>
                  </div>

                  {/* Status & Metrics */}
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-border/50 my-4 bg-muted/20 rounded-2xl px-3">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Sidebar Features
                      </span>
                      <span className="text-sm font-extrabold text-foreground">
                        {isConfigured ? `${routeCount} Permitted` : "Standard Access"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Privileges
                      </span>
                      <span className="text-sm font-extrabold text-foreground">
                        {isConfigured ? `${permCount} Permissions` : "Default"}
                      </span>
                    </div>
                  </div>

                  {/* Feature preview */}
                  {isConfigured && configuredTemplate.allowedNavRoutes?.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Permitted Features Preview
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {configuredTemplate.allowedNavRoutes.slice(0, 4).map((r) => {
                          const seg = r.split("/").pop();
                          return (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[10px] font-semibold border border-primary/10 capitalize truncate max-w-[130px]"
                            >
                              {seg === "chapter-admin" || seg === "state-admin" || seg === "admin"
                                ? "Dashboard"
                                : seg.replace(/-/g, " ")}
                            </span>
                          );
                        })}
                        {configuredTemplate.allowedNavRoutes.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold">
                            +{configuredTemplate.allowedNavRoutes.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                  <Button
                    onClick={() => handleConfigureRole(roleName)}
                    variant={isConfigured ? "outline" : "default"}
                    className={cn(
                      "w-full rounded-xl text-xs font-bold h-10 gap-2 transition-all",
                      !isConfigured && "bg-primary text-primary-foreground"
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {isConfigured ? "Edit Permissions" : "Configure Permissions"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Permission Configuration Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && setModalOpen(false)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 rounded-[28px]">
          <DialogHeader className="mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Configure Permissions: {selectedLevel} {activeRole}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Decide exactly which sidebar navigation features and privileges members with this role receive.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header info badge */}
            <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-2xl border border-border text-xs">
              <span className="font-semibold text-muted-foreground">Hierarchy:</span>
              <span className="font-bold text-foreground px-2.5 py-0.5 rounded-lg bg-background border border-border">
                {selectedLevel} Level
              </span>
              <span className="font-semibold text-muted-foreground ml-2">Role:</span>
              <span className="font-bold text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                {activeRole}
              </span>
            </div>

            {/* Sidebar Navigation Features Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="h-4 w-4 text-primary" />
                    Sidebar Navigation Features ({formData.allowedNavRoutes.length} enabled)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Only checked items will be visible in the sidebar navigation when the member is in this role.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllRoutes}
                    className="h-7 text-[11px] px-2.5 font-bold hover:bg-muted"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllRoutes}
                    className="h-7 text-[11px] px-2.5 font-bold hover:bg-muted text-muted-foreground"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Categorized route checklist */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {featureCategories.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <span className="text-[11px] font-extrabold text-foreground/80 tracking-wider uppercase block">
                      {cat.category}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.items.map((item) => {
                        const Icon = item.icon || Radio;
                        const isChecked = formData.allowedNavRoutes.includes(item.route);

                        return (
                          <div
                            key={item.route}
                            onClick={() => handleToggleRoute(item.route)}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none",
                              isChecked
                                ? "bg-primary/5 border-primary/40 text-foreground shadow-2xs"
                                : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border mt-0.5 transition-colors",
                                isChecked
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 bg-background"
                              )}
                            >
                              {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                <span className="text-xs font-bold leading-tight truncate">{item.label}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-1">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Functional Permissions Section */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-primary" />
                  Functional Action Privileges ({formData.permissions.length} active)
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Grant specific execution powers to this role (e.g. taking attendance, approving verifications).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 border border-border rounded-2xl p-3.5 bg-background">
                {FUNCTIONAL_PERMISSIONS.map((perm) => {
                  const isChecked = formData.permissions.includes(perm.id);

                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className={cn(
                        "flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all select-none",
                        isChecked
                          ? "bg-primary/5 border-primary/40 text-foreground"
                          : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border mt-0.5 transition-colors",
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 bg-background"
                        )}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold leading-tight block">{perm.label}</span>
                        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{perm.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Notes / Purpose (Optional)
              </label>
              <Input
                placeholder={`e.g. Assigned to ${selectedLevel} ${activeRole} to manage operations and meetings`}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saveMutation.isPending}
                className="rounded-xl h-10 px-5 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="rounded-xl h-10 px-6 text-xs font-semibold bg-primary text-primary-foreground"
              >
                {saveMutation.isPending ? "Saving..." : `Save ${activeRole} Permissions`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminRbacPermissions;
