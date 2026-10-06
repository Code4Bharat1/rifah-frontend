import { Suspense } from "react";
import { RegisterUserPage } from "@modules/auth";

export const metadata = {
  title: "Member & User Registration | RIFAH Chamber of Commerce",
  description: "Join RIFAH Chamber network as an individual member or business user. Access chamber networking, enquiries, events, and learning management.",
};

export default function Page(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <RegisterUserPage {...props} />
    </Suspense>
  );
}
