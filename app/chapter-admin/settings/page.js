import { AdminSettings } from "@modules/admin";

export default function Page(props) {
  return <AdminSettings expectedRole="chapter_admin" {...props} />;
}
