import { Suspense } from "react";
import { RegisterBusinessPage } from "@modules/auth";

export default function Page(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <RegisterBusinessPage {...props} />
    </Suspense>
  );
}
