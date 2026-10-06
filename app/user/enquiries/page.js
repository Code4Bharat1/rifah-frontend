import { BizEnquiries } from "@modules/workspace";

export const metadata = {
  title: "Enquiries & Leads | RIFAH Connect",
  description: "Discover buyer enquiries and trade requirements.",
};

export default function Page(props) {
  return <BizEnquiries role="user" {...props} />;
}
