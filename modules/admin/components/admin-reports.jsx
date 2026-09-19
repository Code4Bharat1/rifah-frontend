"use client";
import { useState } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { reportApi, eventApi } from "@shared/lib/api-services";
import { toast } from "sonner";
import { FileDown, Receipt, Users, Megaphone, Eye, Loader2, UserCircle, MapPin, Calendar, Clock, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@shared/providers/auth-provider";
import { Pill } from "@shared/components/rifah/badges";
import { ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { CreatableCombobox } from "@shared/components/rifah/creatable-combobox";
import { useStates, useChapters } from "@shared/hooks/use-rifah-api";
import { ArrowLeft } from "lucide-react";

function EventAnalyticsDetailView({ event, onBack }) {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ["event_registrations_analytics", event?._id || event?.id],
    queryFn: async () => {
      const id = event?._id || event?.id;
      if (!id) return [];
      const res = await eventApi.getRegistrations(id);
      return res.data || [];
    },
    enabled: !!event,
  });

  const presentCount = registrations?.filter(r => r.attendanceStatus === "Present").length || 0;
  const rate = event?.attendanceRate || 0;
  const isGreen = rate >= 75;
  const isYellow = rate >= 40 && rate < 75;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-surface shadow-sm overflow-hidden relative">
        <div className={`absolute top-0 left-0 right-0 h-2 ${isGreen ? 'bg-emerald-500' : isYellow ? 'bg-amber-400' : 'bg-rose-500'}`} />
        
        <div className="px-6 py-8 border-b border-border bg-muted/20">
          <div className="flex items-start gap-3 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-primary/10 text-primary">
              {event?.chapter}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${isGreen ? 'bg-emerald-500/10 text-emerald-600' : isYellow ? 'bg-amber-400/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'}`}>
              {rate}% Attendance Rate
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {event?.title}
          </h2>
          <div className="mt-4 flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered</p>
                <p className="text-sm font-bold text-foreground">{event?.registeredCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground">
                <UserCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attended</p>
                <p className="text-sm font-bold text-foreground">{presentCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h3 className="text-lg font-bold tracking-tight mb-6">Attendee Details</h3>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p className="text-sm font-medium">Loading attendee data...</p>
            </div>
          ) : !registrations || registrations.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-2xl bg-muted/20">
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-base font-medium text-muted-foreground">No registrations found for this event.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {registrations.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shadow-sm group-hover:scale-105 transition-transform">
                      {r.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{r.user?.name || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="capitalize">{r.user?.role?.replace("_", " ")}</span>
                        {r.user?.chapter && (
                          <>
                            <span className="h-1 w-1 shrink-0 rounded-full bg-border" />
                            <span className="truncate">{r.user.chapter}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <Pill tone={r.attendanceStatus === "Present" ? "success" : "neutral"} className="text-[10px] uppercase tracking-wider font-bold">
                      {r.attendanceStatus || "Pending"}
                    </Pill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventAnalyticsTab() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ state: "All", chapter: "All", status: "All" });
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  if (selectedEvent) {
    return <EventAnalyticsDetailView event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  return (
    <div className="space-y-8">
      {/* Global Filters at the top */}
      <div className="flex flex-col sm:flex-row gap-4 p-5 bg-surface/50 backdrop-blur-xl border border-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:mr-4">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </div>
          <h3 className="font-semibold text-foreground">Global Filters</h3>
        </div>
        
        {(user?.role === "central_admin") && (
          <div className="w-full sm:w-64">
            <Label className="text-xs mb-1.5 block font-medium text-muted-foreground uppercase tracking-wider">State</Label>
            <CreatableCombobox 
              options={stateOptions}
              value={filters.state}
              onValueChange={(val) => setFilters(prev => ({ ...prev, state: val || "All", chapter: "All" }))}
              placeholder="Search state..."
            />
          </div>
        )}
        {["central_admin", "state_admin"].includes(user?.role) && (
          <div className="w-full sm:w-64">
            <Label className="text-xs mb-1.5 block font-medium text-muted-foreground uppercase tracking-wider">Chapter</Label>
            <CreatableCombobox 
              options={chapterOptions}
              value={filters.chapter}
              onValueChange={(val) => setFilters(prev => ({ ...prev, chapter: val || "All" }))}
              placeholder="Search chapter..."
            />
          </div>
        )}
      </div>

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

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold tracking-tight">Events Attendance Breakdown</h2>
          
          <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "grid" 
                  ? "bg-surface shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "table" 
                  ? "bg-surface shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              Table
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center border border-dashed rounded-2xl"><p className="text-muted-foreground animate-pulse font-medium">Loading Analytics...</p></div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-2xl"><p className="text-muted-foreground">No events match the selected filters.</p></div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => {
              const rate = e.attendanceRate || 0;
              const isGreen = rate >= 75;
              const isYellow = rate >= 40 && rate < 75;
              
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedEvent(e)}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group hover:border-primary/50 hover:-translate-y-1"
                >
                  {/* Decorative top border based on health */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${isGreen ? 'bg-emerald-500' : isYellow ? 'bg-amber-400' : 'bg-rose-500'}`} />
                  
                  <div className="flex justify-between items-start gap-4 mb-4 mt-1">
                    <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">{e.title}</h4>
                  </div>
                  
                  <div className="mb-6 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                      {e.chapter}
                    </span>
                  </div>
                  
                  <div className="mt-auto space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Registered</p>
                        <p className="text-xl font-bold">{e.registeredCount} <span className="text-sm font-medium text-muted-foreground">/ {e.capacity || '∞'}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Attended</p>
                        <p className="text-xl font-bold">{e.attendedCount}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-4 border-t border-border/60">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground uppercase tracking-wider">Attendance Rate</span>
                        <span className={isGreen ? 'text-emerald-600' : isYellow ? 'text-amber-600' : 'text-rose-600'}>
                          {rate}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isGreen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isYellow ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
            <ResponsiveTable 
              rows={events}
              onRowClick={(row) => setSelectedEvent(row)}
              columns={[
                { key: "title", header: "Event Title", cell: r => <div className="font-bold max-w-[250px] truncate text-foreground group-hover:text-primary transition-colors">{r.title}</div> },
                { key: "chapter", header: "Chapter", cell: r => (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
                    {r.chapter}
                  </span>
                )},
                { key: "metrics", header: "Reg / Cap", cell: r => <span className="font-medium">{r.registeredCount} <span className="text-muted-foreground text-xs">/ {r.capacity || '∞'}</span></span> },
                { key: "attended", header: "Attended", cell: r => <span className="font-bold">{r.attendedCount}</span> },
                { key: "health", header: "Health & Attendance", cell: r => {
                  const rate = r.attendanceRate || 0;
                  const isGreen = rate >= 75;
                  const isYellow = rate >= 40 && rate < 75;
                  return (
                    <div className="flex items-center gap-3 w-40">
                      <span className={`text-sm font-bold w-12 ${isGreen ? 'text-emerald-600' : isYellow ? 'text-amber-600' : 'text-rose-600'}`}>
                        {rate}%
                      </span>
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isGreen ? 'bg-emerald-500' : isYellow ? 'bg-amber-400' : 'bg-rose-500'}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                }}
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminReports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("exports");
  const [revenueDates, setRevenueDates] = useState({ start: "", end: "" });
  const [memberDates, setMemberDates] = useState({ start: "", end: "" });
  const [leadDates, setLeadDates] = useState({ start: "", end: "" });
  const [businessDates, setBusinessDates] = useState({ start: "", end: "" });
  
  const [loading, setLoading] = useState({ revenue: false, members: false, leads: false, businesses: false });
  const [viewing, setViewing] = useState({ revenue: false, members: false, leads: false, businesses: false });
  const [viewData, setViewData] = useState(null);

  const handleDownload = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let dates = {};
      if (type === 'revenue') dates = revenueDates;
      else if (type === 'memberships') dates = memberDates;
      else if (type === 'leads') dates = leadDates;
      else if (type === 'businesses') dates = businessDates;

      const params = {};
      if (dates.start) params.startDate = dates.start;
      if (dates.end) params.endDate = dates.end;

      if (type === 'revenue') {
        await reportApi.downloadRevenue(params);
      } else if (type === 'memberships') {
        await reportApi.downloadMemberships(params);
      } else if (type === 'leads') {
        await reportApi.downloadLeads(params);
      } else if (type === 'businesses') {
        await reportApi.downloadBusinesses(params);
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
      else if (type === 'businesses') dates = businessDates;

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
      } else if (type === 'businesses') {
        res = await reportApi.getBusinesses(params);
      }
      
      setViewData({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        headers: res?.data?.headers || [],
        rows: res?.data?.rows || [],
        rawBusinesses: res?.data?.rawBusinesses || null
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
          {/* Revenue Report - Hidden for chapter admins */}
          {user?.role !== "chapter_admin" && (
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
          )}

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
          title={user?.role === "chapter_admin" ? "Enquiries" : "Leads & Enquiries"} 
          icon={<Megaphone className="h-5 w-5 text-orange-500" />}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              {user?.role === "chapter_admin" 
                ? "Export enquiry data, statuses, and sources." 
                : "Export lead distribution data, statuses, and enquiry sources."}
            </p>
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

        {/* Businesses Report - Shown only for chapter admins */}
        {user?.role === "chapter_admin" && (
          <Panel 
            title="Businesses" 
            icon={<Building2 className="h-5 w-5 text-emerald-500" />}
          >
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Export all registered businesses and their verification status.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Start Date (Optional)</Label>
                  <Input type="date" value={businessDates.start} onChange={e => setBusinessDates({...businessDates, start: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">End Date (Optional)</Label>
                  <Input type="date" value={businessDates.end} onChange={e => setBusinessDates({...businessDates, end: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  className="w-full" 
                  onClick={() => handleView('businesses')} 
                  disabled={viewing.businesses}
                >
                  <Eye className="mr-2 h-4 w-4" /> View
                </Button>
                <Button 
                  className="w-full" 
                  onClick={() => handleDownload('businesses')} 
                  disabled={loading.businesses}
                >
                  <FileDown className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            </div>
          </Panel>
        )}
      </div>

      <Dialog open={!!viewData} onOpenChange={(o) => !o && setViewData(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{viewData?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            {viewData?.title === "Memberships Report" && user?.role === "chapter_admin" && viewData?.rawBusinesses ? (
              <div className="p-4 bg-background">
                {viewData.rawBusinesses.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">No data found for the selected dates.</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {viewData.rawBusinesses.map((b, idx) => {
                      const owner = b.owner || {};
                      const name = owner.name || b.contactPerson || "Member";
                      const role = b.roleInBusiness || owner.roleInBusiness || b.designation || "Member";
                      const location = [b.city, b.state].filter(Boolean).join(", ");
                      const industry = b.categories?.length > 0 ? b.categories.join(", ") : b.industry;
                      const ask = owner.sourcingInterest || "Looking for reliable business partners and networking opportunities.";
                      const give = b.productsSummary?.join(", ") || b.servicesSummary?.join(", ") || b.about || "Quality products and services in our industry.";
                      
                      return (
                        <div key={b._id} className="border border-border rounded-xl bg-card overflow-hidden shadow-sm flex flex-col relative transition-all hover:shadow-md text-left">
                          <div className="absolute top-3 left-3 text-sm font-bold text-muted-foreground w-6 h-6 flex items-center justify-center">
                            {idx + 1}.
                          </div>
                          <div className="p-4 pl-10 flex gap-4 border-b border-border bg-muted/5">
                            <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                              {b.logo || owner.avatar ? (
                                <img src={b.logo || owner.avatar} alt="Profile" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                                  {name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <h3 className="font-bold text-lg text-foreground truncate pr-2">{name}</h3>
                              <p className="text-sm font-medium text-foreground leading-tight mt-1">
                                {b.name} <span className="text-muted-foreground font-normal text-xs ml-1">• {role} • {b.membership?.toUpperCase()}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1.5 truncate flex items-center gap-1">
                                {location} <span className="text-border">|</span> {industry}
                              </p>
                            </div>
                          </div>
                          
                          <div className="p-4 flex flex-col gap-3 flex-1 text-sm bg-background">
                            <div>
                              <span className="font-bold text-amber-500 mr-2">ASK:</span>
                              <span className="text-foreground/90">{ask}</span>
                            </div>
                            <div>
                              <span className="font-bold text-green-600 mr-2">GIVE:</span>
                              <span className="text-foreground/90">{give}</span>
                            </div>
                          </div>
                          
                          <div className="p-3 px-4 border-t border-border bg-muted/10 text-xs flex flex-wrap gap-x-6 gap-y-2 items-center">
                            {b.whatsapp || b.whatsappNumber ? (
                              <div className="flex gap-1.5 items-center">
                                <span className="font-bold text-green-600">WhatsApp:</span> 
                                <span className="font-medium text-foreground">{b.whatsapp || b.whatsappNumber}</span>
                              </div>
                            ) : (
                              <div className="flex gap-1.5 items-center">
                                <span className="font-bold text-foreground">Phone:</span> 
                                <span className="font-medium text-foreground">{b.phone || owner.phone}</span>
                              </div>
                            )}
                            
                            <div className="flex gap-1.5 items-center ml-auto">
                              <span className="font-bold text-foreground">Email:</span> 
                              <span className="font-medium text-foreground truncate max-w-[150px]">{b.email || owner.email}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
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
            )}
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
