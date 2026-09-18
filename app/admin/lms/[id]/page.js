import { AdminCourseBuilder } from "@modules/admin/components/admin-course-builder";

export const metadata = {
  title: "Course Curriculum Builder | RIFAH Central Admin",
  description: "Manage course chapters, video lectures, and PDF documents",
};

export default function AdminCourseDetailPage() {
  return <AdminCourseBuilder role="admin" />;
}
