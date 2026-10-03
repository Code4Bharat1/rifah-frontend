import { AdminNotifications } from "@modules/admin";

export default function Page(props) {
  return <AdminNotifications expectedRole="chapter_admin" {...props} />;
}

