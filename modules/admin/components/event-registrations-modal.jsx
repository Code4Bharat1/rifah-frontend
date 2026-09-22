import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Pill } from "@shared/components/rifah/badges";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";

export function EventRegistrationsModal({ eventId, eventTitle, open, onOpenChange }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["event_registrations", eventId],
    queryFn: async () => {
      const res = await eventApi.getRegistrations(eventId);
      return res.data || [];
    },
    enabled: !!eventId && open,
  });

  const totalCount = registrations?.length || 0;
  const presentCount = registrations?.filter(r => r.attendanceStatus === "Present").length || 0;

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
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !registrations || registrations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
              No registrations found for this event yet.
            </div>
          ) : (
              <ResponsiveTable rows={registrations} columns={[
                { key: "name", header: "Name", cell: r => r.user?.name || "Unknown" },
                { key: "email", header: "Email", cell: r => r.user?.email || "N/A" },
                { key: "phone", header: "Phone", cell: r => r.user?.phone || "N/A" },
                { key: "role", header: "Role", cell: r => <span className="capitalize">{r.user?.role?.replace("_", " ")}</span> },
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
