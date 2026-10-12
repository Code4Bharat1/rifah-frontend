import { VisaReferralsList } from "@modules/workspace";

export const metadata = {
  title: "My Visa Referrals | Member Portal | RIFAH",
  description: "Track your Chamber Visa Referral and Recommendation applications.",
};

export default function Page(props) {
  return <VisaReferralsList portalType="user" {...props} />;
}
