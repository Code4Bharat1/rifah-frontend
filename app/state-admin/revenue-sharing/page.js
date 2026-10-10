import { RevenueSharing } from "@modules/admin/components/revenue-sharing/revenue-sharing";

export const metadata = {
  title: "Revenue Sharing | RIFAH State Admin",
  description: "Your state's and its chapters' revenue allocations, claims and settlements",
};

export default function RevenueSharingPage() {
  return <RevenueSharing expectedRole="state_admin" />;
}
