import { AdminUsers } from "@modules/admin";

export const metadata = {
  title: "Members | State Admin | RIFAH Connect",
  description: "Manage regional state members and accounts",
};

export default function StateAdminMembersPage(props) {
  return <AdminUsers {...props} />;
}
