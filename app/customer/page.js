import { CustomerDiscover } from "@modules/customer";

export const metadata = {
  title: "Discover Businesses | Customer Portal | RIFAH",
  description: "Browse verified businesses, request custom price quotations and send enquiries.",
};

export default function Page(props) {
  return <CustomerDiscover {...props} />;
}
