"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, UserX, Search, Clock, CreditCard } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Badge } from "@shared/components/ui/badge";
import { toast } from "sonner";
import { eventApi } from "@shared/lib/api-services";

export function EntranceDesk({ eventId, chapterMembers = [] }) {
  const [attendees, setAttendees] = useState([]);
  const [mergedList, setMergedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, waiting: 0, approved: 0 });

  useEffect(() => {
    if (eventId) {
      fetchRegistrations();
    }
  }, [eventId]);

  const fetchRegistrations = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await eventApi.getRegistrations(eventId);
      if (res.success) {
        const sorted = (res.data || []).sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
        setAttendees(sorted);
        
        // Calculate stats
        const total = sorted.length;
        const waiting = sorted.filter(a => a.gateStatus === "waiting" || !a.gateStatus).length;
        const approved = sorted.filter(a => a.gateStatus === "approved").length;
        setStats({ total, waiting, approved });
      }
    } catch (err) {
      toast.error("Failed to load attendees for entrance desk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const combined = [];
    const registeredUserIds = new Set();
    
    // Add all registered attendees
    attendees.forEach(a => {
      const uId = a.user?._id || a.user?.id || a.user;
      if (uId) registeredUserIds.add(String(uId));
      combined.push({
        ...a,
        isRegistered: true,
      });
    });
    
    // Add chapter members who haven't registered
    chapterMembers.forEach(m => {
      if (!registeredUserIds.has(String(m._id))) {
        combined.push({
          _id: m._id, // use member id as key
          user: m,
          isRegistered: false,
          gateStatus: 'not_registered'
        });
      }
    });
    
    setMergedList(combined);
  }, [attendees, chapterMembers]);

  const handleGateAction = async (attendeeId, action) => {
    try {
      const res = await eventApi.gateAction(eventId, attendeeId, action);
      if (res.success) {
        toast.success(`Attendee ${action} successfully`);
        // Optimistically update UI
        setAttendees(prev => prev.map(a => 
          a._id === attendeeId ? { ...a, gateStatus: action } : a
        ));
        setStats(prev => ({
          ...prev,
          waiting: action === 'approved' ? prev.waiting - 1 : prev.waiting,
          approved: action === 'approved' ? prev.approved + 1 : prev.approved
        }));
      }
    } catch (err) {
      toast.error(`Failed to ${action} attendee`);
    }
  };

  const filteredAttendees = mergedList.filter(a => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (a.user?.name || "").toLowerCase().includes(term);
    const companyMatch = (a.user?.company || a.user?.businessName || "").toLowerCase().includes(term);
    const emailMatch = (a.user?.email || "").toLowerCase().includes(term);
    return nameMatch || companyMatch || emailMatch;
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
      {/* Headcount Dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total Registered</p>
          <p className="text-3xl font-black text-foreground">{stats.total}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl shadow-sm text-center">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Approved Entry</p>
          <p className="text-3xl font-black text-emerald-600">{stats.approved}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl shadow-sm text-center">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Waiting in Queue</p>
          <p className="text-3xl font-black text-amber-600">{stats.waiting}</p>
        </div>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email, or company to quickly verify..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-card border-primary/20 focus-visible:ring-primary"
        />
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Attendee Info</th>
                <th className="px-4 py-3 font-semibold">Member Status</th>
                <th className="px-4 py-3 font-semibold">Payment Status</th>
                <th className="px-4 py-3 font-semibold">Gate Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-muted-foreground">
                    No attendees found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((attendee, index) => {
                  const isMember = ["Customer", "Business Owner", "Chapter Admin"].includes(attendee.user?.role);
                  const status = attendee.gateStatus || "waiting";
                  
                  return (
                    <tr key={attendee._id || index} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground">{attendee.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{attendee.user?.email}</div>
                        <div className="text-xs text-muted-foreground">{attendee.user?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        {isMember ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">RIFAH Member</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">Guest Visitor</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className={`font-semibold ${attendee.paymentStatus === 'Paid' || attendee.paymentStatus === 'Free' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {attendee.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {attendee.isRegistered ? (
                          <>
                            {status === "waiting" && (
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleGateAction(attendee._id, "approved")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                                >
                                  <UserCheck className="h-4 w-4 mr-1" /> Approve Entry
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleGateAction(attendee._id, "rejected")}
                                  className="border-rose-200 hover:bg-rose-50 text-rose-600 h-8 px-2"
                                  title="Reject Entry"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {status === "approved" && (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-1">
                                <UserCheck className="h-3 w-3 mr-1" /> Entry Approved
                              </Badge>
                            )}
                            {status === "rejected" && (
                              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 py-1">
                                <UserX className="h-3 w-3 mr-1" /> Entry Denied
                              </Badge>
                            )}
                          </>
                        ) : (
                          <div className="text-center w-full">
                            <a href={`/chapter-admin/events/${eventId}/edit`} className="text-xs text-primary font-bold hover:underline cursor-pointer">
                              Not registered yet
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
