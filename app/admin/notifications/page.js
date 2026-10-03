import { AdminNotifications } from "@modules/admin";

export default function Page(props) {
  return <AdminNotifications expectedRole="admin" {...props} />;
}

