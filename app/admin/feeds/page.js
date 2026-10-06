import { BizFeeds } from "@modules/workspace";

export const metadata = {
  title: "Feeds | Central Administration | RIFAH Connect",
  description: "Explore updates, announcements, and connect with business members.",
};

export default function Page(props) {
  return <BizFeeds {...props} />;
}
