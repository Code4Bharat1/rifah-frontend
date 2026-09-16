import { AdminUsers } from "@modules/admin";

export const metadata = {
  title: "Users | State Admin | RIFAH Connect",
  description: "Manage regional state users and accounts",
};

export default function StateAdminUsersPage(props) {
  return <AdminUsers {...props} />;
}
