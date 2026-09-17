import { AdminEventDetail } from "@modules/admin/components/admin-event-detail";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage(props) {
  // Await params in Next 15+ to ensure dynamic rendering is correctly triggered
  const params = await props.params;
  return <AdminEventDetail />;
}
