import React from "react";
import { ShieldCheck, Ticket, MessageSquareText, CreditCard, Mic, Camera, User, FileText, Monitor, LogOut, Award, Mic2, Megaphone, CheckSquare } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Save } from "lucide-react";

export function MyTeamTab({ teamRoles, setTeamRoles, chapterMembers, handleSaveTeamRoles }) {
  
  const handleRoleChange = (roleKey, value) => {
    setTeamRoles((prev) => ({ ...prev, [roleKey]: value }));
  };

  const operationsRoles = [
    { key: "chapterAdmin", label: "Chapter Admin", desc: "Overall command & approval", icon: ShieldCheck },
    { key: "entranceIncharge", label: "Gate / Entrance Incharge", desc: "Gate check-in & badges", icon: Ticket },
    { key: "followupCoordinator", label: "Follow-up Coordinator", desc: "Post-event calls", icon: MessageSquareText },
    { key: "treasurer", label: "Treasurer", desc: "Accounts, ledger & money", icon: CreditCard },
    { key: "guestManager", label: "Guest & Speaker Manager", desc: "Stage liaison", icon: Mic },
    { key: "photosVideo", label: "Photos & Video (media team)", desc: "Captures moments", icon: Camera },
    { key: "eventCoordinator", label: "Event Coordinator", desc: "Runs the programme", icon: User },
  ];

  const stageRoles = [
    { key: "tilawatEquran", label: "Tilawat-e-Quran by", icon: FileText },
    { key: "presidentWelcome", label: "Welcome Address (President)", icon: Monitor },
    { key: "secretaryIntro", label: "Team Intro Giver (Secretary)", icon: User },
    { key: "keynote1", label: "Keynote Speaker 1", icon: Mic2, hasTopic: true },
    { key: "keynote2", label: "Keynote Speaker 2", icon: Mic2, hasTopic: true },
    { key: "heroOfEvent", label: "Hero of the Event presented by", icon: Award },
    { key: "best60SecPitch", label: "Best 60 Second Pitch by", icon: Megaphone },
    { key: "closingRemarks", label: "Closing Remarks by", icon: CheckSquare },
    { key: "voteOfThanks", label: "Vote of Thanks by", icon: MessageSquareText },
    { key: "eventEnd", label: "Event End / Farewell by", icon: LogOut },
  ];

  const renderSelect = (roleKey, label) => (
    <Select
      value={teamRoles[roleKey] || ""}
      onValueChange={(val) => handleRoleChange(roleKey, val)}
    >
      <SelectTrigger className="text-xs h-9 bg-background border-border text-foreground w-full mt-1">
        <SelectValue placeholder="-- Select participant --" />
      </SelectTrigger>
      <SelectContent className="max-h-56 bg-card border-border text-foreground">
        {teamRoles[roleKey] && !chapterMembers.some((mem) => mem.name === teamRoles[roleKey]) && (
          <SelectItem value={teamRoles[roleKey]} className="text-xs font-semibold">
            {teamRoles[roleKey]} (Assigned)
          </SelectItem>
        )}
        {chapterMembers.map((mem) => (
          <SelectItem key={mem._id || mem.id} value={mem.name} className="text-xs">
            {mem.name} — {mem.organization || mem.company || mem.role || "Member"} {mem.phone ? `(${mem.phone})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-8">
      {/* SECTION 1: OPERATIONS TEAM */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            My Chapter Team
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your team are members. Pick them from the member list. They will see "My Duties" in their app.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {operationsRoles.map((m, idx) => (
            <div
              key={m.key}
              className="p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <m.icon className="h-4 w-4" />
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{m.label}</h4>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
              <div className="pt-2">
                {renderSelect(m.key, m.label)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: ROLE ASSIGNMENTS */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Role Assignments
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Photo & details appear automatically on the projector and in the Live Scripts during their slide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {stageRoles.map((role) => (
            <div key={role.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <role.icon className="h-3.5 w-3.5" />
                  {role.label}
                </label>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Checkbox id={`cb-${role.key}`} disabled />
                <label htmlFor={`cb-${role.key}`} className="text-[10px] text-muted-foreground">
                  allow their own presentation
                </label>
              </div>
              {renderSelect(role.key, role.label)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-6 pt-6 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Keynote 1 Topic</label>
            <Input 
              className="h-9 text-xs" 
              value={teamRoles.keynote1Topic || ""}
              onChange={(e) => handleRoleChange("keynote1Topic", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Keynote 2 Topic</label>
            <Input 
              className="h-9 text-xs" 
              value={teamRoles.keynote2Topic || ""}
              onChange={(e) => handleRoleChange("keynote2Topic", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Keynote 1 Poster</label>
            <div className="flex items-center gap-2 text-xs border border-border rounded-md px-3 py-1.5 bg-muted/20">
              <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled>Choose File</Button>
              <span className="text-muted-foreground">No file chosen</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Keynote 2 Poster</label>
            <div className="flex items-center gap-2 text-xs border border-border rounded-md px-3 py-1.5 bg-muted/20">
              <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled>Choose File</Button>
              <span className="text-muted-foreground">No file chosen</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <Checkbox id="cb-remote" disabled />
            <label htmlFor="cb-remote" className="text-xs text-muted-foreground">
              Let the Event Coordinator run the programme from his own phone (Next / Hold / Start)
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSaveTeamRoles}
            className="gap-2 font-semibold shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save Assignments</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
