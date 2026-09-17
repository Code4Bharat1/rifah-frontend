import { AdminMemberships } from "@modules/admin";

export const metadata = {
  title: "Members | Chapter Admin | RIFAH Connect",
  description: "Manage local chapter members and users",
};

export default function ChapterAdminMembersPage(props) {
  return <AdminMemberships {...props} />;
}
