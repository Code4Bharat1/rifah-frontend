import { BizMessages } from "@modules/workspace";

export const metadata = {
  title: "Messages | RIFAH Connect",
  description: "Direct messaging with verified businesses and chamber partners.",
};

export default function Page(props) {
  return <BizMessages role="user" {...props} />;
}
