import { AdminCourseBuilder } from "@modules/admin/components/admin-course-builder";

export const metadata = {
  title: "Course Curriculum Builder | RIFAH State Admin",
  description: "Manage course chapters, video lectures, and PDF documents",
};

export default function StateAdminCourseDetailPage() {
  return <AdminCourseBuilder role="state_admin" />;
}
