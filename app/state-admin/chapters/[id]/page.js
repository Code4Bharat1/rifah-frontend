import AdminChapterDetails from "@modules/admin/components/admin-chapter-details";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chapter Details | RIFAH State Admin",
  description: "View and manage chapter details",
};

export default async function StateAdminChapterDetailsPage(props) {
  const params = await props.params;
  return <AdminChapterDetails chapterId={params.id} />;
}
