"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * @deprecated
 * Leads functionality has been fully merged into /biz/enquiries.
 * This file redirects any legacy mounts to /biz/enquiries.
 */
export function BizLeads() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/biz/enquiries");
  }, [router]);

  return null;
}

export default BizLeads;
