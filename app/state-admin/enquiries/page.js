import { AdminEnquiries } from "@modules/admin";

export const metadata = {
  title: "Enquiries & Leads | State Admin | RIFAH Connect",
  description: "Manage regional enquiries, delegations, and leads",
};

export default function StateAdminEnquiriesPage(props) {
  return <AdminEnquiries {...props} />;
}
