import { AdminEventForm } from "../../../../modules/admin/components/admin-event-form";

export const metadata = {
  title: "Create Event | RIFAH Administration",
};

export default function AdminEventCreatePage() {
  return <AdminEventForm isEditMode={false} />;
}
