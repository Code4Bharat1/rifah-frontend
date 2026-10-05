import { CustomerEnquiries } from "@modules/customer";

export const metadata = {
  title: "My Enquiries & Quotations | Customer Portal | RIFAH",
  description: "View and track sent enquiries, status updates, and received price quotations.",
};

export default function Page(props) {
  return <CustomerEnquiries {...props} />;
}
