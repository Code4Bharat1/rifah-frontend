import { AdminLms } from "@modules/admin/components/admin-lms";

export const metadata = {
  title: "LMS | RIFAH Central Admin",
  description: "Manage courses and training material",
};

export default function LmsPage() {
  return <AdminLms role="admin" />;
}
