import { RevenueSharing } from "@modules/admin/components/revenue-sharing/revenue-sharing";

export const metadata = {
  title: "Revenue Sharing | RIFAH Central Admin",
  description: "Membership and event revenue allocations, claims and settlements",
};

export default function RevenueSharingPage() {
  return <RevenueSharing expectedRole="admin" />;
}
