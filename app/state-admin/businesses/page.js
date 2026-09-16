import { AdminBusinesses } from "@modules/admin";

export const metadata = {
  title: "Businesses | State Admin | RIFAH Connect",
  description: "Manage regional state businesses",
};

export default function StateAdminBusinessesPage(props) {
  return <AdminBusinesses {...props} />;
}
