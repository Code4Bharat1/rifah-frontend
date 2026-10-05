"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BizNotifications } from "@modules/workspace";
import { useAuth } from "@shared/providers/auth-provider";

export default function CustomerNotificationsPage(props) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?role=customer&redirect=${encodeURIComponent("/customer/notifications")}`);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</div>;
  }

  return <BizNotifications role="customer" {...props} />;
}
