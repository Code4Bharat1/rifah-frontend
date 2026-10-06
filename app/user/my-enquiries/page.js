import { BizMyEnquiries } from "@modules/workspace";

export const metadata = {
  title: "My Enquiries | RIFAH Connect",
  description: "Manage and track your posted enquiries and buyer requirements.",
};

export default function Page(props) {
  return <BizMyEnquiries role="user" {...props} />;
}
