"use client";

import React, { useState, useEffect } from "react";
import { FileStack, Download, Eye, Palette, CheckCircle2 } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { toast } from "sonner";
import { eventApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

export function CertificatesTab({ eventId }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState("classic");
  const [accentColor, setAccentColor] = useState("#06b6d4");
  const { token } = useAuth();

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
        // Only show attendees who have checked in or have been approved
        const eligible = (res.data || []).filter(
          a => a.gateStatus === "approved" || a.attendanceStatus === "Present"
        );
        setAttendees(eligible);
      }
    } catch (err) {
      toast.error("Failed to load attendees for certificates");
    } finally {
      setLoading(false);
    }
  };

  const getCertificateDownloadUrl = (attendeeId) => {
    return `${eventApi.getCertificateUrl(eventId, attendeeId, selectedStyle, accentColor)}&token=${token}`;
  };

  const downloadAll = () => {
    toast.info("Generating batch certificates... This might take a while.");
    attendees.forEach((a, index) => {
      setTimeout(() => {
        window.open(getCertificateDownloadUrl(a._id), "_blank");
      }, index * 1500); // Stagger downloads
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Style Configurator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-primary" />
                Certificate Styling
              </h3>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground">Accent Color</label>
                <div className="flex gap-2">
                  {[
                    { hex: "#06b6d4", name: "Cyan" },
                    { hex: "#3b82f6", name: "Blue" },
                    { hex: "#8b5cf6", name: "Violet" },
                    { hex: "#f59e0b", name: "Amber" },
                    { hex: "#10b981", name: "Emerald" },
                    { hex: "#f43f5e", name: "Rose" },
                  ].map(color => (
                    <button
                      key={color.hex}
                      onClick={() => setAccentColor(color.hex)}
                      className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center`}
                      style={{ backgroundColor: color.hex, borderColor: accentColor === color.hex ? "white" : "transparent" }}
                      title={color.name}
                    >
                      {accentColor === color.hex && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => window.open(getCertificateDownloadUrl("preview"), "_blank")}
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Preview Template
                </span>
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <Button 
                className="w-full justify-between bg-primary/10 text-primary hover:bg-primary/20"
                onClick={downloadAll}
                disabled={attendees.length === 0}
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Download All ({attendees.length})
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Eligible Attendees */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Eligible Attendees</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Attendees who attended the event</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {attendees.length} Ready
              </Badge>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase border-b border-border sticky top-0 bg-card z-10">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Attendee Name</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-4 py-12 text-center text-muted-foreground">
                        No eligible attendees found. Attendees must be marked as 'Present' or 'Approved' at the entrance gate.
                      </td>
                    </tr>
                  ) : (
                    attendees.map((attendee) => (
                      <tr key={attendee._id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{attendee.user?.name}</div>
                          <div className="text-xs text-muted-foreground">{attendee.user?.company || attendee.user?.businessName || "Member"}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(getCertificateDownloadUrl(attendee._id), "_blank")}
                            className="h-8 text-xs font-semibold"
                          >
                            <Download className="h-3 w-3 mr-1.5" /> PDF
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
