import { AdminVisaReferrals } from "@modules/admin";

export const metadata = {
  title: "Visa Referrals Desk | Central Administration | RIFAH",
  description:
    "Central Administration console for reviewing, approving, and delivering official Chamber Visa Referral letters by mail.",
};

export default function Page(props) {
  return <AdminVisaReferrals {...props} />;
}
