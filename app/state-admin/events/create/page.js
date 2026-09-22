import { AdminEventForm } from "@modules/admin/components/admin-event-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create Event | RIFAH State Admin",
  description: "Schedule and publish regional chamber events and conferences",
};

export default function StateAdminEventCreatePage() {
  return <AdminEventForm isEditMode={false} />;
}
