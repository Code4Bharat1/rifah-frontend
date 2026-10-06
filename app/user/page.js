import { UserDashboard } from "@modules/workspace";

export const metadata = {
  title: "Member Workspace | RIFAH Connect",
  description: "Explore opportunities, enquiries, feeds, and networking in your member workspace.",
};

export default function Page(props) {
  return <UserDashboard {...props} />;
}
