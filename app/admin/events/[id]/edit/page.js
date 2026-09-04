"use client";
import { useParams } from "next/navigation";
import { AdminEventForm } from "../../../../../modules/admin/components/admin-event-form";
import { useEventDetail } from "@shared/hooks/use-rifah-api";
import { Loader2 } from "lucide-react";

export default function AdminEventEditPage() {
  const params = useParams();
  const { data: eventData, isLoading } = useEventDetail(params.id);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-2">
        <h2 className="text-xl font-semibold">Event Not Found</h2>
        <p className="text-muted-foreground">The event you are looking for does not exist or was deleted.</p>
      </div>
    );
  }

  return <AdminEventForm isEditMode={true} initialData={eventData} />;
}
