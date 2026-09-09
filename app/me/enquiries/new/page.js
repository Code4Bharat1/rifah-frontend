import { CustomerNewEnquiry } from "@modules/customer";

export const metadata = {
  title: "Post Requirement | RIFAH Customer",
  description: "Submit and broadcast sourcing requirements to RIFAH Chamber members",
};

export default function Page(props) {
  return <CustomerNewEnquiry {...props} />;
}
