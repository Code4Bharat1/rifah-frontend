import { BizNewEnquiry } from "@modules/workspace";

export const metadata = {
  title: "Post B2B Requirement | RIFAH Business",
  description: "Post a sourcing requirement to verified RIFAH Chamber businesses",
};

export default function Page(props) {
  return <BizNewEnquiry {...props} />;
}
