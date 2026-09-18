"use client";
import { useState } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { reportApi } from "@shared/lib/api-services";
import { toast } from "sonner";
import { FileDown, Receipt, Users, Megaphone, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@shared/providers/auth-provider";
import { Pill } from "@shared/components/rifah/badges";
import { ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { CreatableCombobox } from "@shared/components/rifah/creatable-combobox";
import { useStates, useChapters } from "@shared/hooks/use-rifah-api";

function EventAnalyticsTab() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ state: "All", chapter: "All", status: "All" });

  const { data: statesData } = useStates();
  const { data: chaptersData } = useChapters();

  const { data, isLoading } = useQuery({
    queryKey: ["event_analytics", filters],
    queryFn: async () => {
      const res = await reportApi.getEventsAnalytics(filters);
      return res.data;
    }
  });

  const kpis = data?.kpis || { totalEvents: 0, totalRegisteredOverall: 0, overallAttendanceRate: 0 };
  const events = data?.events || [];

  const stateOptions = ["All", ...(statesData?.map(s => s.state || s.name || s).filter(Boolean) || [])];
  
  // Filter chapters based on selected state if needed, or just show all
  let filteredChapters = chaptersData || [];
  if (filters.state !== "All" && filters.state) {
    filteredChapters = filteredChapters.filter(c => c.state === filters.state);
  }
  const chapterOptions = ["All", ...filteredChapters.map(c => c.name || c).filter(Boolean)];

  const leaderboard = data?.leaderboard || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Events" value={kpis.totalEvents} />
        <StatCard title="Total Registrations" value={kpis.totalRegisteredOverall} />
        <StatCard title="Avg Attendance Rate" value={`${kpis.overallAttendanceRate}%`} trend={kpis.overallAttendanceRate > 75 ? "up" : kpis.overallAttendanceRate < 50 ? "down" : "neutral"} trendLabel="Overall" />
      </div>

      {leaderboard.length > 0 && (
        <Panel title="Top Performing Chapters" icon={<span className="text-amber-500">🏆</span>}>
          <div className="space-y-4 pt-2">
            {leaderboard.map((ch, idx) => (
              <div key={ch.name} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold flex items-center justify-center w-6 h-6 rounded-full ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{ch.name}</p>
                    <p className="text-xs text-muted-foreground">{ch.totalEvents} Events</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{ch.attendanceRate}%</p>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Events Attendance Breakdown">
        <div className="flex gap-4 mb-4 flex-wrap">
          {user?.role === "super_admin" && (
            <div className="w-64">
              <Label className="text-xs mb-1 block">State Filter</Label>
              <CreatableCombobox 
                options={stateOptions}
                value={filters.state}
                onValueChange={(val) => setFilters(prev => ({ ...prev, state: val || "All", chapter: "All" }))}
                placeholder="Search state..."
              />
            </div>
          )}
          {["super_admin", "state_admin"].includes(user?.role) && (
            <div className="w-64">
              <Label className="text-xs mb-1 block">Chapter Filter</Label>
              <CreatableCombobox 
                options={chapterOptions}
                value={filters.chapter}
                onValueChange={(val) => setFilters(prev => ({ ...prev, chapter: val || "All" }))}
                placeholder="Search chapter..."
              />
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center"><p className="text-muted-foreground animate-pulse">Loading Analytics...</p></div>
        ) : (
          <ResponsiveTable 
            rows={events}
            columns={[
              { key: "title", header: "Event Title", cell: r => <div className="font-medium max-w-[200px] truncate">{r.title}</div> },
              { key: "chapter", header: "Chapter", cell: r => r.chapter },
              { key: "metrics", header: "Registered / Audience Size", cell: r => `${r.registeredCount} / ${r.capacity || '∞'}` },
              { key: "attended", header: "Attended", cell: r => r.attendedCount },
              { key: "rate", header: "Attendance Rate", cell: r => `${r.attendanceRate}%` },
              { key: "health", header: "Health", cell: r => (
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${r.health === 'Green' ? 'bg-emerald-500' : r.health === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  <span className="text-xs font-medium">{r.health}</span>
                </div>
              )}
            ]}
          />
        )}
      </Panel>
    </div>
  );
}

export function AdminReports() {
  const [activeTab, setActiveTab] = useState("exports");
  const [revenueDates, setRevenueDates] = useState({ start: "", end: "" });
  const [memberDates, setMemberDates] = useState({ start: "", end: "" });
  const [leadDates, setLeadDates] = useState({ start: "", end: "" });
  
  const [loading, setLoading] = useState({ revenue: false, members: false, leads: false });
  const [viewing, setViewing] = useState({ revenue: false, members: false, leads: false });
  const [viewData, setViewData] = useState(null);

  const handleDownload = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let dates = {};
      if (type === 'revenue') dates = revenueDates;
      else if (type === 'memberships') dates = memberDates;
      else if (type === 'leads') dates = leadDates;

      const params = {};
      if (dates.start) params.startDate = dates.start;
      if (dates.end) params.endDate = dates.end;

      if (type === 'revenue') {
        await reportApi.downloadRevenue(params);
      } else if (type === 'memberships') {
        await reportApi.downloadMemberships(params);
      } else if (type === 'leads') {
        await reportApi.downloadLeads(params);
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully.`);
    } catch (err) {
      toast.error(err.message || "Failed to download report.");
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleView = async (type) => {
    setViewing(prev => ({ ...prev, [type]: true }));
    try {
      let dates = {};
      if (type === 'revenue') dates = revenueDates;
      else if (type === 'memberships') dates = memberDates;
      else if (type === 'leads') dates = leadDates;

      const params = {};
      if (dates.start) params.startDate = dates.start;
      if (dates.end) params.endDate = dates.end;

      let res;
      if (type === 'revenue') {
        res = await reportApi.getRevenue(params);
      } else if (type === 'memberships') {
        res = await reportApi.getMemberships(params);
      } else if (type === 'leads') {
        res = await reportApi.getLeads(params);
      }
      
      setViewData({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        headers: res?.data?.headers || [],
        rows: res?.data?.rows || []
      });
    } catch (err) {
      toast.error(err.message || "Failed to fetch report data.");
    } finally {
      setViewing(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <AppShell
      role="admin"
      title="Reports & Analytics"
      subtitle="Download CSV reports or view real-time event analytics"
    >
      <div className="border-b mb-6">
        <div className="flex gap-4">
          <button 
            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'exports' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('exports')}
          >
            Data Exports
          </button>
          <button 
            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'events' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('events')}
          >
            Event Analytics
          </button>
        </div>
      </div>

      {activeTab === 'exports' ? (
        <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Revenue Report */}
        <Panel 
          title="Revenue & Payments" 
          icon={<Receipt className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Export all paid transactions, invoices, and payment details.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date (Optional)</Label>
                <Input type="date" value={revenueDates.start} onChange={e => setRevenueDates({...revenueDates, start: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date (Optional)</Label>
                <Input type="date" value={revenueDates.end} onChange={e => setRevenueDates({...revenueDates, end: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => handleView('revenue')} 
                disabled={viewing.revenue}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button 
                className="w-full" 
                onClick={() => handleDownload('revenue')} 
                disabled={loading.revenue}
              >
                <FileDown className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </Panel>

        {/* Memberships Report */}
        <Panel 
          title="Memberships" 
          icon={<Users className="h-5 w-5 text-blue-500" />}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Export all registered active users, their roles, and chapters.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date (Optional)</Label>
                <Input type="date" value={memberDates.start} onChange={e => setMemberDates({...memberDates, start: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date (Optional)</Label>
                <Input type="date" value={memberDates.end} onChange={e => setMemberDates({...memberDates, end: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => handleView('memberships')} 
                disabled={viewing.members}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button 
                className="w-full" 
                onClick={() => handleDownload('memberships')} 
                disabled={loading.members}
              >
                <FileDown className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </Panel>

        {/* Leads & Enquiries Report */}
        <Panel 
          title="Leads & Enquiries" 
          icon={<Megaphone className="h-5 w-5 text-orange-500" />}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Export lead distribution data, statuses, and enquiry sources.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date (Optional)</Label>
                <Input type="date" value={leadDates.start} onChange={e => setLeadDates({...leadDates, start: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date (Optional)</Label>
                <Input type="date" value={leadDates.end} onChange={e => setLeadDates({...leadDates, end: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => handleView('leads')} 
                disabled={viewing.leads}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button 
                className="w-full" 
                onClick={() => handleDownload('leads')} 
                disabled={loading.leads}
              >
                <FileDown className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      <Dialog open={!!viewData} onOpenChange={(o) => !o && setViewData(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{viewData?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted text-muted-foreground sticky top-0">
                <tr>
                  {viewData?.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {viewData?.rows.length === 0 ? (
                  <tr>
                    <td colSpan={viewData.headers.length} className="px-4 py-8 text-center text-muted-foreground">
                      No data found for the selected dates.
                    </td>
                  </tr>
                ) : (
                  viewData?.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-3 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
      </>
      ) : (
        <EventAnalyticsTab />
      )}
    </AppShell>
  );
}
