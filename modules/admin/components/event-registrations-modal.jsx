import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Pill } from "@shared/components/rifah/badges";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";

export function EventRegistrationsModal({ eventId, eventTitle, open, onOpenChange }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["event_registrations", eventId],
    queryFn: async () => {
      const res = await eventApi.getRegistrations(eventId);
      return res.data || [];
    },
    enabled: !!eventId && open,
  });

  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    if (roleFilter === "all") return registrations;
    return registrations.filter((r) => (r.role || "guest") === roleFilter);
  }, [registrations, roleFilter]);

  const totalCount = filteredRegistrations.length;
  const presentCount = filteredRegistrations.filter(r => r.attendanceStatus === "Present").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={isFullscreen 
          ? "max-w-full h-screen max-h-screen sm:w-screen sm:h-screen sm:max-h-screen sm:rounded-none sm:max-w-none overflow-y-auto" 
          : "max-w-4xl max-h-[85vh] overflow-y-auto"
        }
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-12 top-2 h-8 w-8 rounded-sm opacity-70 hover:opacity-100 hidden sm:flex"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          <span className="sr-only">Toggle Fullscreen</span>
        </Button>
        <DialogHeader>
          <DialogTitle className="pr-16">Registrations: {eventTitle}</DialogTitle>
          <DialogDescription>
            List of users who have registered for this event.
            <span className="mt-2 block font-medium text-foreground">
              Total Registered: {totalCount} | Attended: {presentCount}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Filter by Role</h4>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="non_member">Non Member</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
              No registrations found for this role/event.
            </div>
          ) : (
              <ResponsiveTable rows={filteredRegistrations} columns={[
                { key: "name", header: "Name", cell: r => r.user?.name || "Unknown" },
                { key: "email", header: "Email", cell: r => r.user?.email || "N/A" },
                { key: "phone", header: "Phone", cell: r => r.user?.phone || "N/A" },
                { key: "role", header: "Role", cell: r => {
                    const role = r.role || "guest";
                    if (role === "member") return <span className="font-semibold text-blue-600">Member</span>;
                    if (role === "non_member") return <span className="text-orange-600">Non Member</span>;
                    return <span className="text-gray-600">Guest</span>;
                }},
                { key: "chapter", header: "Chapter", cell: r => r.user?.chapter || "N/A" },
                { key: "attendance", header: "Attendance", cell: r => <Pill tone={r.attendanceStatus === "Present" ? "success" : "neutral"}>{r.attendanceStatus || "Pending"}</Pill> },
                { key: "amount", header: "Amount", cell: r => <span className="font-semibold text-emerald-600">{r.amountPaid ? `₹${r.amountPaid}` : "Free"}</span> },
                { key: "date", header: "Registered At", cell: r => new Date(r.registeredAt).toLocaleString() },
              ]} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
