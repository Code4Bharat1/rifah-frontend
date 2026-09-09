"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { eventApi } from "@shared/lib/api-services";

import { useAuth } from "@shared/providers/auth-provider";

export function AdminEventForm({ initialData = null, isEditMode = false }) {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = ["super_admin", "secretariat"].includes(user?.role);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Helper to parse "10:00 AM - 01:00 PM" into { start: "10:00", end: "13:00" }
  const parseTimeString = (timeStr) => {
    if (!timeStr) return { startTime: "10:00", endTime: "13:00" };
    try {
      const parts = timeStr.split("-").map(s => s.trim());
      if (parts.length !== 2) return { startTime: "10:00", endTime: "13:00" };
      
      const to24Hour = (timeStr12h) => {
        const [time, modifier] = timeStr12h.split(" ");
        if (!time || !modifier) return "10:00";
        let [hours, minutes] = time.split(":");
        if (hours === "12") {
          hours = "00";
        }
        if (modifier.toUpperCase() === "PM") {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours.toString().padStart(2, "0")}:${minutes}`;
      };

      return {
        startTime: to24Hour(parts[0]),
        endTime: to24Hour(parts[1])
      };
    } catch (e) {
      return { startTime: "10:00", endTime: "13:00" };
    }
  };

  const initialFormState = {
    title: "",
    description: "",
    date: "",
    startTime: "10:00",
    endTime: "13:00",
    mode: "In-person",
    location: "Chamber Conference Hall",
    city: "Mumbai",
    chapter: "Mumbai Chapter",
    targetAudience: ["All"],
    targetChapters: ["All"],
    cover: null,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      const parsedTime = parseTimeString(initialData.time);
      setFormData({
        ...initialFormState,
        ...initialData,
        location: initialData.venue || initialData.location || "",
        date: initialData.date ? new Date(initialData.date).toISOString().split("T")[0] : "",
        startTime: parsedTime.startTime,
        endTime: parsedTime.endTime,
        cover: null, // Keep cover null to allow new upload
      });
    }
  }, [initialData]);

  const toggleAudience = (audience) => {
    setFormData((prev) => {
      const current = prev.targetAudience || [];
      if (audience === "All") {
        return { ...prev, targetAudience: current.includes("All") ? [] : ["All"] };
      }
      const withoutAll = current.filter(a => a !== "All");
      if (withoutAll.includes(audience)) {
        return { ...prev, targetAudience: withoutAll.filter((a) => a !== audience) };
      }
      return { ...prev, targetAudience: [...withoutAll, audience] };
    });
  };

  const toggleChapter = (chapter) => {
    setFormData((prev) => {
      const current = prev.targetChapters || [];
      if (chapter === "All") {
        return { ...prev, targetChapters: current.includes("All") ? [] : ["All"] };
      }
      const withoutAll = current.filter(a => a !== "All");
      if (withoutAll.includes(chapter)) {
        return { ...prev, targetChapters: withoutAll.filter((a) => a !== chapter) };
      }
      return { ...prev, targetChapters: [...withoutAll, chapter] };
    });
  };

  const formatTimeStr = (start, end) => {
    const to12h = (time24h) => {
      if (!time24h) return "10:00 AM";
      let [h, m] = time24h.split(":");
      let hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, "0")}:${m} ${ampm}`;
    };
    return `${to12h(start)} - ${to12h(end)}`;
  };

  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.date) {
      toast.error("Title and Date are required");
      return;
    }
    
    if (publish) setLoading(true);
    else setSavingDraft(true);

    try {
      const payload = { 
        ...formData, 
        time: formatTimeStr(formData.startTime, formData.endTime),
        venue: formData.location,
        status: publish ? "Upcoming" : "Draft"
      };
      delete payload.startTime;
      delete payload.endTime;
      delete payload.cover;

      let eventId = isEditMode ? initialData._id : null;

      if (isEditMode) {
        await eventApi.update(eventId, payload);
        toast.success(publish ? "Event published successfully" : "Draft updated successfully");
      } else {
        const created = await eventApi.create(payload);
        eventId = created?.data?._id || created?._id;
        toast.success(publish ? (isSuperAdmin ? "Event published successfully" : "Event submitted for approval") : "Draft saved successfully");
      }

      if (formData.cover && eventId) {
        toast.info("Uploading cover image...");
        await eventApi.uploadCover(eventId, formData.cover);
        toast.success("Cover image uploaded");
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save event");
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title={isEditMode ? "Edit Event" : "Create New Event"}
      subtitle={isEditMode ? "Update event details and manage publishing." : "Draft a new chamber event or workshop."}
      actions={
        <Button variant="outline" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Link>
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Panel title="Event Details" className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Annual Export Growth Conclave 2026"
                className="text-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time <span className="text-destructive">*</span></Label>
                <Input
                  id="startTime"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time <span className="text-destructive">*</span></Label>
                <Input
                  id="endTime"
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select value={formData.mode} onValueChange={(val) => setFormData({ ...formData, mode: val })}>
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-person">In-person</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue / Meeting Link</Label>
              <Input
                id="venue"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Full Description & Agenda</Label>
              <Textarea
                id="desc"
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write the full event details here. This will be shown on the event landing page."
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="cover">Cover Image (Optional)</Label>
              <div className="flex items-center gap-4">
                {formData.cover ? (
                  <div className="relative h-24 w-40 rounded-lg overflow-hidden border border-border shadow-sm group">
                    <img
                      src={URL.createObjectURL(formData.cover)}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, cover: null });
                        const fileInput = document.getElementById('cover');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-0.5 truncate">
                      {formData.cover.name}
                    </div>
                  </div>
                ) : (
                  <div className="h-24 w-40 bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-[10px]">No image selected</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({ ...formData, cover: e.target.files[0] });
                      }
                    }}
                    className="max-w-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">Recommended: 1200×630px, max 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Publishing & Notifications" className="p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <Label className="text-base">Target Audience</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Select which user segments should receive email invitations and in-app alerts when you publish this event. 
                  (No notifications are sent if you save as a draft).
                </p>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                {["All", "Consumers", "Businesses", "Chapter Admins"].map((aud) => (
                  <div key={aud} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`aud-${aud}`} 
                      checked={(formData.targetAudience || []).includes(aud)}
                      onCheckedChange={() => toggleAudience(aud)}
                    />
                    <label htmlFor={`aud-${aud}`} className="text-sm font-medium leading-none cursor-pointer">
                      {aud}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t">
              <div>
                <Label className="text-base">Target Chapters</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Select which chapters this event should be visible to.
                </p>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                {["All", "Mumbai Chapter", "Pune Chapter", "Delhi Chapter", "Bangalore Chapter"].map((chap) => (
                  <div key={chap} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`chap-${chap.replace(/\s+/g, '-')}`} 
                      checked={(formData.targetChapters || []).includes(chap)}
                      onCheckedChange={() => toggleChapter(chap)}
                    />
                    <label htmlFor={`chap-${chap.replace(/\s+/g, '-')}`} className="text-sm font-medium leading-none cursor-pointer">
                      {chap}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleSave(false)} 
                disabled={loading || savingDraft}
                className="w-32"
              >
                {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save as Draft"}
              </Button>
              <Button 
                onClick={() => handleSave(true)} 
                disabled={loading || savingDraft}
                className="w-48 bg-primary"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSuperAdmin ? "Publish & Broadcast" : "Submit for Approval")}
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
