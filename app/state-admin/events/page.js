import { AdminEvents } from "@modules/admin";

export const metadata = {
  title: "Events | State Admin | RIFAH Connect",
  description: "Manage regional state events and conferences",
};

export default function StateAdminEventsPage(props) {
  return <AdminEvents {...props} />;
}
