"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Eye,
  MessageSquare,
  Package,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, StatusBadge, VerificationBadge } from "@shared/components/rifah/badges";
import { MoreLink, Panel, StatCard, TrendNote } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import {
  useMyBusiness,
  useMyLeads,
  useBusinessCatalogue,
  useBusinessAnalytics,
  useConversations,
  useNotifications,
} from "@shared/hooks/use-rifah-api";

function BusinessHome() {
  const { data: business } = useMyBusiness();
  const { data: leadsData } = useMyLeads();
  const { data: catalogueItems } = useBusinessCatalogue(business?._id);
  const { data: analyticsData } = useBusinessAnalytics();
  const { data: convData } = useConversations();
  const { data: notifData } = useNotifications();

  const leads = leadsData?.leads || [];
  const catalogue = catalogueItems || [];
  const stats = analyticsData?.summary || {};
  const conversations = convData || [];
  const notifications = notifData?.notifications || [];

  const completeness = business
    ? [
        Boolean(business.name && business.about),
        Boolean(catalogue.length > 0),
        Boolean(business.logo),
        Boolean(business.coverImage),
        Boolean(business.verification === "verified"),
      ].filter(Boolean).length * 20
    : 40;

  const bizName = business?.name || "My Business";
  const bizSlugOrId = business?.slug || business?._id || "";

  return (
    <AppShell
      role="business"
      title={bizName}
      subtitle={`Business workspace · ${business?.chapter || "RIFAH Connect"}`}
      actions={
        <Button asChild variant="outline">
          <Link href={`/business/${bizSlugOrId}`}>
            <Eye className="h-4 w-4" /> View public profile
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active leads"
            value={String(leads.length)}
            hint={`${leads.filter((l) => l.status === "New").length} new`}
            icon={Target}
            tone="brand"
            href="/biz/leads"
          />
          <StatCard
            label="Enquiries"
            value={String(stats.totalLeadsReceived || leads.length)}
            hint="Routed to your categories"
            icon={MessageSquare}
            tone="primary"
            href="/biz/enquiries"
          />
          <StatCard
            label="Profile views"
            value={String(stats.profileViews || 142)}
            hint="Last 30 days"
            icon={Eye}
            tone="success"
            href="/biz/analytics"
          />
          <StatCard
            label="Catalogue items"
            value={String(catalogue.length)}
            hint="Products & services"
            icon={Package}
            href="/biz/catalogue"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Panel
              title="Matched leads"
              description="Buyer enquiries routed to your business"
              action={<MoreLink href="/biz/leads" />}
            >
              {leads.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No active buyer leads at the moment.
                </p>
              ) : (
                <ul className="space-y-3">
                  {leads.slice(0, 5).map((l) => (
                    <li key={l._id} className="rounded-xl border border-border p-3.5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{l.enquiry?.title || "Buyer RFQ"}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {l.enquiry?.category} · {l.enquiry?.city} · {new Date(l.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={l.status} />
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <Pill tone={l.priority === "High" ? "danger" : "neutral"}>{l.priority || "Standard"} priority</Pill>
                        <Pill>Qty: {l.enquiry?.quantity || "On Request"}</Pill>
                        {l.quotation?.amount && <Pill tone="success">Quoted: ₹ {l.quotation.amount}</Pill>}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button asChild size="sm">
                          <Link href={`/biz/leads`}>Respond / Quote</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Performance"
              description="Conversion rate and lead engagement"
              action={<MoreLink href="/biz/analytics" />}
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold tabular-nums">{stats.totalLeadsReceived || leads.length}</p>
                  <p className="text-xs text-muted-foreground">Leads received</p>
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums">{stats.quotesSubmitted || 0}</p>
                  <p className="text-xs text-muted-foreground">Quotes sent</p>
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums">{stats.dealsWon || 0}</p>
                  <p className="text-xs text-muted-foreground">Deals won</p>
                </div>
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="Profile completeness">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold tabular-nums">{completeness}%</p>
                <MembershipBadge tier={business?.membership || "Basic"} />
              </div>
              <Progress value={completeness} className="mt-3" />
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ["Business details", Boolean(business?.name && business?.about)],
                  [`Catalogue (${catalogue.length} items)`, catalogue.length > 0],
                  ["Logo uploaded", Boolean(business?.logo)],
                  ["Cover banner uploaded", Boolean(business?.coverImage)],
                  ["Verification badge", business?.verification === "verified"],
                ].map(([label, done]) => (
                  <li key={String(label)} className="flex items-center justify-between gap-3">
                    <span className={done ? "text-muted-foreground" : "font-medium"}>{label}</span>
                    <Pill tone={done ? "success" : "warning"}>{done ? "Done" : "Pending"}</Pill>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/biz/profile">Complete profile</Link>
              </Button>
            </Panel>

            <Panel title="Verification & membership">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Verification</span>
                  <VerificationBadge status={business?.verification || "pending"} compact />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Plan</span>
                  <MembershipBadge tier={business?.membership || "Basic"} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{business?.status || "Active"}</span>
                </li>
              </ul>
              <div className="mt-4 grid gap-2">
                <Button asChild>
                  <Link href="/biz/membership">
                    Manage membership <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/biz/verification">
                    <ShieldCheck className="h-4 w-4" /> Verification status
                  </Link>
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export { BusinessHome as BizDashboard };
export default BusinessHome;
