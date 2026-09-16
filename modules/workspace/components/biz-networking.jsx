"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users2,
  Plus,
  MapPin,
  CalendarDays,
  Clock,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
  Handshake,
  Loader2,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { MemberPicker } from "@shared/components/rifah/member-picker";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { useAuth } from "@shared/providers/auth-provider";
import { useMyBusiness, useMyOneToOnes, useMyThankYouNotes, useMyThankYouSummary } from "@shared/hooks/use-rifah-api";
import { oneToOneApi, thankYouNoteApi } from "@shared/lib/api-services";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const emptyMeetingForm = {
  meetingDate: "",
  meetingTime: "",
  location: "",
  description: "",
  initiatedBy: "",
};

function BizNetworking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myBusiness } = useMyBusiness();
  const { data: meetingsData, isLoading: meetingsLoading } = useMyOneToOnes();
  const meetings = Array.isArray(meetingsData) ? meetingsData : [];

  const { data: notesData } = useMyThankYouNotes();
  const notes = Array.isArray(notesData) ? notesData : [];

  const { data: summary } = useMyThankYouSummary();
  const totalGiven = summary?.totalGiven || 0;
  const totalReceived = summary?.totalReceived || 0;

  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [meetingForm, setMeetingForm] = useState(emptyMeetingForm);
  const [isSavingMeeting, setIsSavingMeeting] = useState(false);

  const [isThankYouDialogOpen, setIsThankYouDialogOpen] = useState(false);
  const [thankYouMember, setThankYouMember] = useState(null);
  const [thankYouAmount, setThankYouAmount] = useState("");
  const [thankYouNote, setThankYouNote] = useState("");
  const [isSavingThankYou, setIsSavingThankYou] = useState(false);

  const resetMeetingDialog = () => {
    setSelectedMember(null);
    setMeetingForm(emptyMeetingForm);
  };

  const resetThankYouDialog = () => {
    setThankYouMember(null);
    setThankYouAmount("");
    setThankYouNote("");
  };

  const handleSaveMeeting = async () => {
    if (!selectedMember) {
      toast.error("Please select the member you met.");
      return;
    }
    if (!meetingForm.meetingDate) {
      toast.error("Please select the meeting date.");
      return;
    }
    if (!meetingForm.meetingTime) {
      toast.error("Please select the meeting time.");
      return;
    }
    if (!meetingForm.location.trim()) {
      toast.error("Please enter the meeting location.");
      return;
    }
    if (!meetingForm.description.trim()) {
      toast.error("Please describe the purpose / discussion of the meeting.");
      return;
    }
    if (!meetingForm.initiatedBy) {
      toast.error("Please specify who initiated the meeting.");
      return;
    }

    setIsSavingMeeting(true);
    try {
      await oneToOneApi.create({
        memberBusinessId: selectedMember._id,
        meetingDate: meetingForm.meetingDate,
        meetingTime: meetingForm.meetingTime,
        location: meetingForm.location.trim(),
        description: meetingForm.description.trim(),
        initiatedBy: meetingForm.initiatedBy,
      });
      toast.success("One to one meeting recorded successfully");
      setIsMeetingDialogOpen(false);
      resetMeetingDialog();
      queryClient.invalidateQueries({ queryKey: ["one-to-ones"] });
    } catch (error) {
      toast.error(error.message || "Failed to record the meeting");
    } finally {
      setIsSavingMeeting(false);
    }
  };

  const handleSaveThankYou = async () => {
    if (!thankYouMember) {
      toast.error("Please select the member you're thanking.");
      return;
    }
    const amount = Number(thankYouAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsSavingThankYou(true);
    try {
      await thankYouNoteApi.create({
        counterpartBusinessId: thankYouMember._id,
        amount,
        note: thankYouNote.trim(),
      });
      toast.success("Thank you note recorded successfully");
      setIsThankYouDialogOpen(false);
      resetThankYouDialog();
      queryClient.invalidateQueries({ queryKey: ["thank-you-notes"] });
    } catch (error) {
      toast.error(error.message || "Failed to record the thank you note");
    } finally {
      setIsSavingThankYou(false);
    }
  };

  const myUserId = user?._id || user?.id;

  const givenNotes = notes.filter((n) => String(n.giverUser?._id || n.giverUser) === String(myUserId));
  const receivedNotes = notes.filter((n) => String(n.receiverUser?._id || n.receiverUser) === String(myUserId));

  const renderNotesList = (list, counterpartKey, emptyLabel) => {
    if (list.length === 0) {
      return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
    }
    return (
      <div className="space-y-3">
        {list.map((n) => {
          const counterpart = n[counterpartKey];
          return (
            <div key={n._id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{counterpart?.name || "RIFAH Member"}</p>
                {n.note && <p className="text-xs text-muted-foreground truncate">{n.note}</p>}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className="text-sm font-bold whitespace-nowrap">{currencyFormatter.format(n.amount)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AppShell
      role="business"
      title="Networking"
      subtitle="Log 1-2-1 meetings with fellow members and track the business you've generated for each other"
      actions={
        <Button variant="outline" onClick={() => setIsThankYouDialogOpen(true)}>
          <Handshake className="mr-2 h-4 w-4" /> Give Thank You Note
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard label="One to One meetings" value={String(meetings.length)} icon={Users2} tone="primary" />
          <StatCard
            label="Business given"
            value={currencyFormatter.format(totalGiven)}
            icon={ArrowUpRight}
            tone="success"
            hint="Business you generated for others"
          />
          <StatCard
            label="Business received"
            value={currencyFormatter.format(totalReceived)}
            icon={ArrowDownLeft}
            tone="brand"
            hint="Business others generated for you"
          />
        </div>

        <Tabs defaultValue="one-to-one">
          <TabsList>
            <TabsTrigger value="one-to-one">One to One</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="one-to-one" className="space-y-4">
            <Panel
              title="One to One meetings"
              description="Meetings you've logged with fellow RIFAH members, across chapters"
              action={
                <Button size="sm" onClick={() => setIsMeetingDialogOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Log New Meeting
                </Button>
              }
            >
              {meetingsLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading meetings...
                </div>
              ) : meetings.length === 0 ? (
                <EmptyState
                  icon={Users2}
                  title="No one to one meetings logged yet"
                  description="Met a fellow RIFAH member? Log the meeting to keep a record visible to your chapter and state admins."
                  action={
                    <Button onClick={() => setIsMeetingDialogOpen(true)}>
                      <Plus className="mr-1.5 h-4 w-4" /> Log New Meeting
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {meetings.map((m) => {
                    const iInitiated = String(m.initiatorUser?._id || m.initiatorUser) === String(myUserId);
                    const counterpartBusiness = iInitiated ? m.memberBusiness : m.initiatorBusiness;
                    const counterpartChapter = iInitiated ? m.memberChapterId : m.initiatorChapterId;
                    const initiatedByLabel =
                      m.initiatedBy === "self"
                        ? iInitiated
                          ? "You initiated this meeting"
                          : `${counterpartBusiness?.name || "They"} initiated this meeting`
                        : iInitiated
                          ? `${counterpartBusiness?.name || "They"} initiated this meeting`
                          : "You initiated this meeting";

                    return (
                      <div key={m._id} className="rounded-xl border border-border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{counterpartBusiness?.name || "RIFAH Member"}</p>
                            <p className="text-xs text-muted-foreground">
                              {counterpartChapter?.name || counterpartChapter?.state || "Chapter"}
                              {counterpartChapter?.state ? ` · ${counterpartChapter.state}` : ""}
                            </p>
                          </div>
                          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            {initiatedByLabel}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {new Date(m.meetingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> {m.meetingTime}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" /> {m.location}
                          </span>
                        </div>
                        <p className="mt-2.5 text-sm text-foreground/90">{m.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel
              title="Business Generated"
              description="Thank you notes exchanged with fellow members for business given and received"
              action={
                <Button size="sm" variant="outline" onClick={() => setIsThankYouDialogOpen(true)}>
                  <Handshake className="mr-1.5 h-4 w-4" /> Give Thank You Note
                </Button>
              }
            >
              <Tabs defaultValue="given">
                <TabsList>
                  <TabsTrigger value="given">
                    <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" /> Business Given
                  </TabsTrigger>
                  <TabsTrigger value="received">
                    <ArrowDownLeft className="mr-1.5 h-3.5 w-3.5" /> Business Received
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="given">
                  {renderNotesList(givenNotes, "receiverBusiness", "You haven't given business to any member yet.")}
                </TabsContent>
                <TabsContent value="received">
                  {renderNotesList(receivedNotes, "giverBusiness", "You haven't received business from any member yet.")}
                </TabsContent>
              </Tabs>
            </Panel>
          </TabsContent>

          <TabsContent value="referrals">
            <Panel title="Referrals">
              <EmptyState
                icon={Sparkles}
                title="Referrals — coming soon"
                description="Tracking referral slips between members is on the way. One to One meetings are ready to use today."
              />
            </Panel>
          </TabsContent>
        </Tabs>
      </div>

      {/* Log New Meeting Dialog */}
      <Dialog
        open={isMeetingDialogOpen}
        onOpenChange={(open) => {
          setIsMeetingDialogOpen(open);
          if (!open) resetMeetingDialog();
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log a One to One Meeting</DialogTitle>
            <DialogDescription>
              Select the state and chapter of the member you met, then pick them from the list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <MemberPicker
              idPrefix="meeting"
              excludeBusinessId={myBusiness?._id}
              onChange={setSelectedMember}
              disabled={isSavingMeeting}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="meeting-date">Date *</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingForm.meetingDate}
                  onChange={(e) => setMeetingForm((f) => ({ ...f, meetingDate: e.target.value }))}
                  disabled={isSavingMeeting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meeting-time">Time *</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingForm.meetingTime}
                  onChange={(e) => setMeetingForm((f) => ({ ...f, meetingTime: e.target.value }))}
                  disabled={isSavingMeeting}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-location">Location *</Label>
              <Input
                id="meeting-location"
                placeholder="e.g. Taj Lands End, Bandra"
                value={meetingForm.location}
                onChange={(e) => setMeetingForm((f) => ({ ...f, location: e.target.value }))}
                disabled={isSavingMeeting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-description">Description / Purpose *</Label>
              <Textarea
                id="meeting-description"
                rows={3}
                placeholder="What did you discuss? Any follow-ups or opportunities identified?"
                value={meetingForm.description}
                onChange={(e) => setMeetingForm((f) => ({ ...f, description: e.target.value }))}
                disabled={isSavingMeeting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-initiated-by">Meeting was initiated by *</Label>
              <Select
                value={meetingForm.initiatedBy}
                onValueChange={(v) => setMeetingForm((f) => ({ ...f, initiatedBy: v }))}
                disabled={isSavingMeeting}
              >
                <SelectTrigger id="meeting-initiated-by" className="h-10">
                  <SelectValue placeholder="Select who reached out first" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Myself</SelectItem>
                  <SelectItem value="member">The person I met</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMeetingDialogOpen(false)} disabled={isSavingMeeting}>
              Cancel
            </Button>
            <Button onClick={handleSaveMeeting} disabled={isSavingMeeting}>
              {isSavingMeeting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Give Thank You Note Dialog */}
      <Dialog
        open={isThankYouDialogOpen}
        onOpenChange={(open) => {
          setIsThankYouDialogOpen(open);
          if (!open) resetThankYouDialog();
        }}
      >
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Give a Thank You Note</DialogTitle>
            <DialogDescription>
              Thank a member who gave you business — select them below. This shows as "Business Received" on your account and "Business Given" on theirs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <MemberPicker
              idPrefix="thank-you"
              excludeBusinessId={myBusiness?._id}
              onChange={setThankYouMember}
              disabled={isSavingThankYou}
            />
            <div className="space-y-1.5">
              <Label htmlFor="thank-you-amount">Business amount (₹) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="thank-you-amount"
                  type="number"
                  min="1"
                  className="pl-9"
                  placeholder="e.g. 50000"
                  value={thankYouAmount}
                  onChange={(e) => setThankYouAmount(e.target.value)}
                  disabled={isSavingThankYou}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thank-you-note">Note (optional)</Label>
              <Textarea
                id="thank-you-note"
                rows={2}
                placeholder="e.g. Thanks for the referral that closed this deal"
                value={thankYouNote}
                onChange={(e) => setThankYouNote(e.target.value)}
                disabled={isSavingThankYou}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsThankYouDialogOpen(false)} disabled={isSavingThankYou}>
              Cancel
            </Button>
            <Button onClick={handleSaveThankYou} disabled={isSavingThankYou}>
              {isSavingThankYou ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Thank You Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { BizNetworking };
export default BizNetworking;
