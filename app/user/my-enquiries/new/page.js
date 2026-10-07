import { BizNewEnquiry } from "@modules/workspace";

export const metadata = {
  title: "Post Requirement | RIFAH Connect",
  description: "Post a sourcing requirement to verified RIFAH Chamber businesses",
};

export default function Page(props) {
  return <BizNewEnquiry role="user" {...props} />;
}
