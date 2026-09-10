import { AdminBusinessDetail } from "../../../../modules/admin/components/admin-business-detail";

export const metadata = {
  title: "Business Details | RIFAH Chapter Admin",
};

export default async function ChapterAdminBusinessDetailPage({ params }) {
  const { id } = await params;
  return <AdminBusinessDetail id={id} />;
}
