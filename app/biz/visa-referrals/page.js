import { VisaReferralsList } from "@modules/workspace";

export const metadata = {
  title: "Business Visa Referrals | Workspace | RIFAH",
  description: "Track enterprise Visa Referral and Recommendation applications for overseas trade missions.",
};

export default function Page(props) {
  return <VisaReferralsList portalType="biz" {...props} />;
}
