import { BizFeeds } from "@modules/workspace";

export const metadata = {
  title: "Member Feeds | RIFAH Connect",
  description: "Explore community updates, announcements, and connect with members.",
};

export default function Page(props) {
  return <BizFeeds role="user" {...props} />;
}
