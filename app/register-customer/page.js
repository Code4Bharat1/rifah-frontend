import { Suspense } from "react";
import { RegisterCustomerPage } from "@modules/auth";

export const metadata = {
  title: "Register as Customer | RIFAH Chamber of Commerce",
  description: "Create your RIFAH customer account to discover verified businesses, request custom quotes, and order directly.",
};

export default function Page(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <RegisterCustomerPage {...props} />
    </Suspense>
  );
}
