import { BizNotifications } from "@modules/workspace";

export const metadata = {
  title: "Notifications | RIFAH Connect",
  description: "View real-time updates and chamber announcements.",
};

export default function Page(props) {
  return <BizNotifications role="user" {...props} />;
}
