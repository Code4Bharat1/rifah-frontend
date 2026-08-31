"use client";
import { Suspense } from "react";
import { DiscoverPage } from "@modules/public";

export default function Page(props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
      <DiscoverPage {...props} />
    </Suspense>
  );
}
