import AdminChapterDetails from "@/modules/admin/components/admin-chapter-details";

export const metadata = {
  title: "Chapter Details | RIFAH Administration",
  description: "View and manage chapter details",
};

export default async function Page({ params }) {
  const { id } = await params;
  return <AdminChapterDetails chapterId={id} />;
}
