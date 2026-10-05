"use client";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BizMessages } from "@modules/workspace";
import { useAuth } from "@shared/providers/auth-provider";

function CustomerMessagesGuard(props) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?role=customer&redirect=${encodeURIComponent("/customer/messages")}`);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading messages...</div>;
  }

  return <BizMessages role="customer" {...props} />;
}

export default function Page(props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading messages...</div>}>
      <CustomerMessagesGuard {...props} />
    </Suspense>
  );
}
