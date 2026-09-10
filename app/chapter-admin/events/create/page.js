import { AdminEventForm } from "../../../../modules/admin/components/admin-event-form";

export const metadata = {
  title: "Create Event | RIFAH Chapter Admin",
};

export default function ChapterAdminEventCreatePage() {
  return <AdminEventForm isEditMode={false} />;
}
