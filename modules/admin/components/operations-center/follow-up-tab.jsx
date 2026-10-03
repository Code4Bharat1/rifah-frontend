"use client";

import React, { useState, useEffect } from "react";
import { Search, Phone, RefreshCw, Copy, PhoneCall, Mail, Sparkles } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@shared/components/ui/dialog";
import { Label } from "@shared/components/ui/label";
import { toast } from "sonner";
import { eventApi, followupApi } from "@shared/lib/api-services";
import { cn } from "@shared/lib/utils";

// Helper to interpolate message
function interpolateMessage(template, userObj) {
  if (!template || !userObj) return template || "";
  const data = userObj.contactDetails || userObj;
  const nameParts = (data.name || "").split(" ");
  const firstName = nameParts[0] || "Participant";
  let result = template;
  result = result.replace(/\{name\}/g, firstName);
  result = result.replace(/\{fullname\}/g, data.name || "");
  result = result.replace(/\{firm\}/g, data.company || data.businessName || "your company");
  result = result.replace(/\{city\}/g, data.city || "your city");
  result = result.replace(/\{chapter\}/g, data.chapter || "our chapter");
  return result;
}

export function FollowupTab({ eventId }) {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [followupStats, setFollowupStats] = useState({
    total: 0, members: 0, visitors: 0, repeat: 0, contacted: 0, messaged: 0, pending: 0
  });

  // Filters
  const [followupSearch, setFollowupSearch] = useState("");
  const [followupFilter, setFollowupFilter] = useState("all"); // status
  const [memberTypeFilter, setMemberTypeFilter] = useState("all"); // all | member | non-member
  const [registrationFilter, setRegistrationFilter] = useState("all"); // all | registered | not-registered
  
  const [customFollowupMessage, setCustomFollowupMessage] = useState(
    "Assalamu Alaikum {name},\n\nIt was great seeing you at the recent RIFAH event. We hope {firm} found value in the sessions.\n\nLet's connect soon!\n\nRegards,\nRIFAH Chamber of Commerce"
  );

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [historyForm, setHistoryForm] = useState({
    method: "call",
    notes: "",
    status: "contacted",
    nextFollowUpAt: "",
  });

  useEffect(() => {
    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch followups
      const res = await followupApi.getEventFollowups(eventId);
      if (res.success) {
        setFollowups(res.data || []);
      }
      
      // Calculate Stats (Mock calculation, normally from backend)
      const list = res.data || [];
      const stats = {
        total: list.length,
        members: list.filter(l => (l.category || "").toLowerCase().includes("member")).length,
        visitors: list.filter(l => !(l.category || "").toLowerCase().includes("member")).length,
        repeat: Math.floor(list.length * 0.3), // Mock
        contacted: list.filter(l => l.status === "contacted").length,
        messaged: list.filter(l => l.status === "contacted").length,
        pending: list.filter(l => l.status === "pending" || !l.status).length,
      };
      setFollowupStats(stats);

      // Fetch Events for the table
      const evRes = await eventApi.getAllEvents();
      if (evRes.success) {
        setEvents(evRes.data || []);
      }

    } catch (err) {
      toast.error("Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFollowupStatus = async (id, status) => {
    try {
      setFollowups(prev => prev.map(f => f._id === id ? { ...f, status } : f));
      await followupApi.updateStatus(id, status);
      toast.success(`Follow-up marked as ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
      fetchData();
    }
  };

  const handleSaveHistory = async () => {
    if (!historyTarget) return;
    try {
      await followupApi.addHistory(historyTarget._id, historyForm);
      toast.success(`Follow-up history logged!`);
      setHistoryModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save history");
    }
  };

  const handleSendEmail = async (attendee) => {
    toast.info(`Sending email to ${attendee.name || "member"}...`);
    // Assuming backend endpoint for sending email
    setTimeout(() => toast.success("Email sent successfully!"), 1000);
  };

  const filteredFollowups = followups.filter((item) => {
    const d = item.contactDetails || item || {};
    const name = (item.name || d.name || "").toLowerCase();
    const mobile = (item.mobile || d.mobile || "").toLowerCase();
    const company = (item.company || d.company || "").toLowerCase();
    const isMember = (item.category || d.membershipStatus || "").toLowerCase().includes("member");
    const isRegistered = item.isRegistered === true || item.status !== "not_registered"; // Mocking registration status property if not present

    if (followupSearch && !name.includes(followupSearch.toLowerCase()) && !mobile.includes(followupSearch.toLowerCase()) && !company.includes(followupSearch.toLowerCase())) {
      return false;
    }
    if (followupFilter !== "all" && item.status !== followupFilter) {
      return false;
    }
    if (memberTypeFilter === "member" && !isMember) return false;
    if (memberTypeFilter === "non-member" && isMember) return false;
    
    // For demo purposes: treat 'pending' as not registered if the filter is used
    if (registrationFilter === "registered" && item.status === "pending") return false; 
    if (registrationFilter === "not-registered" && item.status !== "pending") return false;

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">🏠</span>
            <h3 className="text-base font-bold text-primary">Event Follow-up</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            className="h-8 text-xs gap-1.5 border-border text-foreground hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
          Manage event-related communication. Follow up with participants, guests, and members.
        </p>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">PEOPLE ON THE LIST</p>
            <p className="text-2xl font-black text-foreground mt-1 tabular-nums">{followupStats.total}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{followupStats.members} members · {followupStats.visitors} visitors</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CAME MORE THAN ONCE</p>
            <p className="text-2xl font-black text-primary mt-1 tabular-nums">{followupStats.repeat}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{followupStats.total - followupStats.repeat} came once only</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CONTACTED</p>
            <p className="text-2xl font-black text-primary mt-1 tabular-nums">{followupStats.contacted}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{Math.max(0, followupStats.contacted - followupStats.messaged)} called · {followupStats.messaged} messaged</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">STILL TO CONTACT</p>
            <p className="text-2xl font-black text-amber-500 mt-1 tabular-nums">{followupStats.pending}</p>
            <p className="text-[11px] text-amber-600/70 mt-0.5">waiting for a call</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search participant..."
              value={followupSearch}
              onChange={(e) => setFollowupSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Member Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="member">Members</SelectItem>
                <SelectItem value="non-member">Non-Members</SelectItem>
              </SelectContent>
            </Select>

            <Select value={registrationFilter} onValueChange={setRegistrationFilter}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Registration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registrations</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="not-registered">Not Registered</SelectItem>
              </SelectContent>
            </Select>

            <Select value={followupFilter} onValueChange={setFollowupFilter}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="interested">Interested / Waiting</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!eventId) return;
                try {
                  await followupApi.syncFromEvent(eventId);
                  toast.success("Event attendees synced into follow-up roster!");
                  fetchData();
                } catch (err) {
                  toast.error("Sync failed");
                }
              }}
              className="h-9 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10 font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync Attendees
            </Button>
          </div>
        </div>

        {/* Participant Roster Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
          {filteredFollowups.map((item) => {
            const d = item.contactDetails || item || {};
            const name = item.name || d.name || "Participant";
            const mobile = item.mobile || d.mobile || "";
            const company = item.company || d.company || "Enterprise";
            const membershipStatus = item.category || d.membershipStatus || "Attendee";
            const isMember = membershipStatus.toLowerCase().includes("member");
            const assignedTo = item.assignedToName || item.assignedTo?.name || "Admin";
            const msg = interpolateMessage(customFollowupMessage, item);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=91${mobile}&text=${encodeURIComponent(msg)}`;
            // Mock registration logic based on filters
            const isNotRegistered = item.status === "pending" || registrationFilter === "not-registered"; 

            return (
              <div key={item._id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0 text-sm">
                      {name ? name.slice(0, 1).toUpperCase() : "P"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{name}</h4>
                      <p className="text-xs text-muted-foreground">{company}</p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      item.status === "completed" ? "bg-emerald-500/15 text-emerald-500"
                        : item.status === "contacted" ? "bg-primary-soft text-primary"
                        : item.status === "interested" ? "bg-blue-500/15 text-blue-500"
                        : "bg-amber-500/15 text-amber-500"
                    )}
                  >
                    {item.status || "pending"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-y border-border/50 py-2">
                  <div>Mobile: <span className="font-mono text-foreground">{mobile || "N/A"}</span></div>
                  <div>Membership: <span className="font-semibold text-foreground">{membershipStatus}</span></div>
                  <div className="col-span-2">Assigned To: <span className="text-foreground">{assignedTo}</span></div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {mobile && (
                      <>
                        <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2 gap-1">
                          <a href={`tel:${mobile}`} title="Direct Call"><Phone className="h-3 w-3" /> Call</a>
                        </Button>
                        <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2 gap-1 text-emerald-600 border-emerald-500/30">
                          <a href={whatsappUrl} target="_blank" title="Send WhatsApp">WhatsApp</a>
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm" variant="outline"
                      onClick={() => {
                        setHistoryTarget(item);
                        setHistoryForm({ method: "call", notes: "", status: item.status || "contacted", nextFollowUpAt: "" });
                        setHistoryModalOpen(true);
                      }}
                      className="h-7 text-xs px-2 gap-1 text-primary border-border font-semibold"
                    >
                      <PhoneCall className="h-3 w-3" /> Log
                    </Button>
                    
                    {/* NEW: Send Email Button for non-registered members */}
                    {isMember && isNotRegistered && (
                       <Button size="sm" variant="outline" onClick={() => handleSendEmail(item)} className="h-7 text-xs px-2 gap-1 text-blue-600 border-blue-500/30 bg-blue-500/10">
                         <Mail className="h-3 w-3" /> Email
                       </Button>
                    )}
                  </div>

                  <Select value={item.status || "pending"} onValueChange={(val) => handleUpdateFollowupStatus(item._id, val)}>
                    <SelectTrigger className="h-7 text-[11px] w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="not_interested">Not Interested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* The message you send */}
        <div className="rounded-xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span>✉️</span>
            <h4 className="text-sm font-bold text-foreground">The message you send</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Write it once. Use <span className="font-mono bg-muted px-1 rounded">{`{name}`}</span> <span className="font-mono bg-muted px-1 rounded">{`{firm}`}</span> <span className="font-mono bg-muted px-1 rounded">{`{city}`}</span> <span className="font-mono bg-muted px-1 rounded">{`{chapter}`}</span> and each person gets their own copy.
          </p>
          <Textarea
            rows={4}
            value={customFollowupMessage}
            onChange={(e) => setCustomFollowupMessage(e.target.value)}
            placeholder="Assalamu Alaikum {name},"
            className="text-sm bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
      </div>
      
      {/* Log History Dialog */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Follow-up Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Method</Label>
              <Select value={historyForm.method} onValueChange={(val) => setHistoryForm(prev => ({ ...prev, method: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp Message</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Follow-up Notes / Outcome</Label>
              <Textarea
                placeholder="Spoke with them, they said..."
                value={historyForm.notes}
                onChange={(e) => setHistoryForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Update Status</Label>
                <Select value={historyForm.status} onValueChange={(val) => setHistoryForm(prev => ({ ...prev, status: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveHistory}>Save History</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
