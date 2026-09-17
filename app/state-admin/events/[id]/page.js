import { AdminEventDetail } from "@modules/admin/components/admin-event-detail";

export const dynamic = "force-dynamic";

export default async function StateAdminEventDetailPage(props) {
  const params = await props.params;
  return <AdminEventDetail />;
}
