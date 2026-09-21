import { AdminVerification } from "@modules/admin";

export const metadata = {
  title: "Verification Queue - RIFAH Central Admin",
  description: "Review and verify business documents",
};

export default function Page(props) {
  return <AdminVerification {...props} />;
}

export const dynamic = "force-dynamic";
