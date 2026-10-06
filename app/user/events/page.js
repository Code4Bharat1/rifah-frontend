import { BizEvents } from "@modules/workspace";

export const metadata = {
  title: "Chamber Events | RIFAH Connect",
  description: "Browse upcoming summits, chapter meetings, and conclaves.",
};

export default function Page(props) {
  return <BizEvents role="user" {...props} />;
}
