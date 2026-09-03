import { AdminBusinessDetail } from "../../../../modules/admin/components/admin-business-detail";

export const metadata = {
  title: "Business Details | RIFAH Admin",
};

export default async function AdminBusinessDetailPage({ params }) {
  const { id } = await params;
  return <AdminBusinessDetail id={id} />;
}
