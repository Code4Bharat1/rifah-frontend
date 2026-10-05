import { Suspense } from "react";
import { LoginPage } from "@modules/auth";

export default function Page(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <LoginPage {...props} />
    </Suspense>
  );
}
