import { BizNetworking } from "@modules/workspace";

export const metadata = {
  title: "Networking Hub | RIFAH Connect",
  description: "Connect with chamber members and participate in networking groups.",
};

export default function Page(props) {
  return <BizNetworking role="user" {...props} />;
}
