import { AdminNotifications } from "@modules/admin";

export const metadata = {
  title: "Notifications | State Admin | RIFAH Connect",
  description: "State notifications and alerts",
};

export default function StateAdminNotificationsPage(props) {
  return <AdminNotifications {...props} />;
}
