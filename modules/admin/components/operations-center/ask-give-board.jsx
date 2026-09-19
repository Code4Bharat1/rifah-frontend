"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Download, ExternalLink, Briefcase } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { toast } from "sonner";
import { eventApi } from "@shared/lib/api-services";

export function AskGiveBoard({ eventId }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (eventId) {
      fetchBoard();
    }
  }, [eventId]);

  const fetchBoard = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await eventApi.getAskGiveBoard(eventId);
      if (res.success) {
        setAttendees(res.data);
      }
    } catch (err) {
      toast.error("Failed to load Ask & Give board");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Company", "Phone", "Asks", "Gives"];
    const csvContent = attendees.map(a => {
      return [
        a.user?.name || "Unknown",
        a.user?.company || a.user?.businessName || "N/A",
        a.user?.phone || "N/A",
        (a.asks || []).join(" | "),
        (a.gives || []).join(" | ")
      ].map(field => `"${field}"`).join(",");
    });
    
    const csvString = [headers.join(","), ...csvContent].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Ask_Give_Board_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendees = attendees.filter(a => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (a.user?.name || "").toLowerCase().includes(term);
    const companyMatch = (a.user?.company || a.user?.businessName || "").toLowerCase().includes(term);
    const asksMatch = (a.asks || []).some(ask => ask.toLowerCase().includes(term));
    const givesMatch = (a.gives || []).some(give => give.toLowerCase().includes(term));
    return nameMatch || companyMatch || asksMatch || givesMatch;
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
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, company, need, or offering..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={exportCSV} variant="outline" className="w-full sm:w-auto gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {filteredAttendees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
          <Users className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-base font-bold text-foreground">No Networking Data Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {searchTerm ? "No results match your search." : "Attendee Asks & Gives will populate here once they submit their networking profiles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttendees.map((attendee) => (
            <div key={attendee.attendeeId} className="flex flex-col border border-border rounded-xl bg-card overflow-hidden hover:border-primary/50 transition-colors">
              <div className="p-4 border-b border-border/50 bg-muted/10 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground">{attendee.user?.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Briefcase className="h-3 w-3" /> {attendee.user?.company || attendee.user?.businessName || "Independent"}
                  </p>
                </div>
              </div>
              
              <div className="p-4 space-y-4 flex-1">
                <div>
                  <h5 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">They Need (Asks)</h5>
                  {(attendee.asks || []).length > 0 ? (
                    <ul className="space-y-1">
                      {attendee.asks.map((ask, i) => (
                        <li key={i} className="text-sm text-foreground bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                          {ask}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">None listed</p>
                  )}
                </div>
                
                <div>
                  <h5 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">They Offer (Gives)</h5>
                  {(attendee.gives || []).length > 0 ? (
                    <ul className="space-y-1">
                      {attendee.gives.map((give, i) => (
                        <li key={i} className="text-sm text-foreground bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                          {give}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">None listed</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
