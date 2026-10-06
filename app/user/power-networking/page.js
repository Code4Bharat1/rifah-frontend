import { BizPowerNetworking } from "@modules/workspace";

export const metadata = {
  title: "Power Networking | RIFAH Connect",
  description: "Request and schedule 1-to-1 business meetings.",
};

export default function Page(props) {
  return <BizPowerNetworking role="user" {...props} />;
}
