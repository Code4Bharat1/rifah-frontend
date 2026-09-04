"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
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

export function AdminEventForm({ initialData = null, isEditMode = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const initialFormState = {
    title: "",
    description: "",
    date: "",
    time: "10:00 AM - 01:00 PM",
    mode: "In-person",
    location: "Chamber Conference Hall",
    city: "Mumbai",
    chapter: "Mumbai Chapter",
    targetAudience: [],
    cover: null,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialFormState,
        ...initialData,
        location: initialData.venue || initialData.location || "",
        date: initialData.date ? new Date(initialData.date).toISOString().split("T")[0] : "",
        cover: null, // Keep cover null to allow new upload, existing cover URL is ignored here
      });
    }
  }, [initialData]);

  const toggleAudience = (audience) => {
    setFormData((prev) => {
      const current = prev.targetAudience || [];
      if (current.includes(audience)) {
        return { ...prev, targetAudience: current.filter((a) => a !== audience) };
      }
      return { ...prev, targetAudience: [...current, audience] };
    });
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
        venue: formData.location,
        status: publish ? "Upcoming" : "Draft"
      };
      delete payload.cover;

      let eventId = isEditMode ? initialData._id : null;

      if (isEditMode) {
        await eventApi.update(eventId, payload);
        toast.success(publish ? "Event published successfully" : "Draft updated successfully");
      } else {
        const created = await eventApi.create(payload);
        eventId = created?.data?._id || created?._id;
        toast.success(publish ? "Event published successfully" : "Draft saved successfully");
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                <div className="h-20 w-32 bg-muted rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
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
              <div className="flex gap-6 mt-4">
                {["Consumers", "Businesses", "Chapter Admins"].map((aud) => (
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish & Broadcast"}
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
