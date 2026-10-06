import { UserMembership } from "@modules/workspace";

export const metadata = {
  title: "Member Subscription Tiers | RIFAH Connect",
  description: "View and upgrade your personal chamber member subscription tiers.",
};

export default function Page(props) {
  return <UserMembership {...props} />;
}
