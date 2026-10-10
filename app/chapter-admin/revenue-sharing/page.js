import { RevenueSharing } from "@modules/admin/components/revenue-sharing/revenue-sharing";

export const metadata = {
  title: "Revenue Sharing | RIFAH Chapter Admin",
  description: "Your chapter's revenue allocations, claims, settlements and outstanding balance",
};

export default function RevenueSharingPage() {
  return <RevenueSharing expectedRole="chapter_admin" />;
}
