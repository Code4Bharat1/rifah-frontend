import { AdminSettings } from "@modules/admin";

export const metadata = {
  title: "Settings | State Admin | RIFAH Connect",
  description: "Configure state administration preferences",
};

export default function StateAdminSettingsPage(props) {
  return <AdminSettings {...props} />;
}
