import { AdminRolesPage } from "@modules/admin/components/admin-roles";

export const metadata = {
  title: "State Roles & RBAC - RIFAH State Admin",
  description: "Manage State leadership roles and role permissions",
};

export default function StateRolesPage() {
  return <AdminRolesPage expectedRole="state_admin" />;
}
