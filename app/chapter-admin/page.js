import { AdminDashboard } from "@modules/admin";

export const metadata = {
  title: "Chapter Dashboard | RIFAH Connect",
};

export default function Page(props) {
  return <AdminDashboard {...props} />;
}
