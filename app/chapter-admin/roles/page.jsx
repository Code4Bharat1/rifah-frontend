import { AdminRolesPage } from "@modules/admin/components/admin-roles";

export const metadata = {
  title: "Chapter Roles & RBAC - RIFAH Chapter Admin",
  description: "Manage Chapter leadership roles and role permissions",
};

export default function ChapterRolesPage() {
  return <AdminRolesPage expectedRole="chapter_admin" />;
}
