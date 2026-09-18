import { AdminBusinessDetail } from "../../../../modules/admin/components/admin-business-detail";

export const metadata = {
  title: "Business Details | RIFAH State Admin",
};

export default async function StateAdminBusinessDetailPage({ params }) {
  const { id } = await params;
  return <AdminBusinessDetail id={id} />;
}
