import { UserProfile } from "@modules/workspace";

export const metadata = {
  title: "Member Profile | RIFAH Connect",
  description: "Manage your personal profile and business details.",
};

export default function Page(props) {
  return <UserProfile {...props} />;
}
