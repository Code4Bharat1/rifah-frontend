import { AdminCourseBuilder } from "@modules/admin/components/admin-course-builder";

export const metadata = {
  title: "Course Curriculum Builder | RIFAH Chapter Admin",
  description: "Manage course chapters, video lectures, and PDF documents",
};

export default function ChapterAdminCourseDetailPage() {
  return <AdminCourseBuilder role="chapter_admin" />;
}
