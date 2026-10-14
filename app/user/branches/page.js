import { BizBranches } from "@modules/workspace";

export const metadata = {
  title: "Branch Locations | Member Workspace | RIFAH Connect",
  description: "Manage multiple retail stores, corporate offices, and regional branches on RIFAH Connect.",
};

export default function UserBranchesPage(props) {
  return <BizBranches role="user" {...props} />;
}
