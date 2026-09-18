import { BizPowerNetworking } from "@modules/workspace/components/power-networking/biz-power-networking";

export const metadata = {
  title: "⚡ Power Networking | RIFAH Connect",
  description: "B2B matching and connection engine to discover verified RIFAH businesses for your business requirements.",
};

export default function PowerNetworkingPage(props) {
  return <BizPowerNetworking {...props} />;
}
