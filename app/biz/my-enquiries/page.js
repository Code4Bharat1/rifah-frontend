import { BizMyEnquiries } from "@modules/workspace";

export const metadata = {
  title: "My Sourcing Enquiries | RIFAH Business",
  description: "B2B sourcing requirements posted to fellow RIFAH Chamber members",
};

export default function Page(props) {
  return <BizMyEnquiries {...props} />;
}
