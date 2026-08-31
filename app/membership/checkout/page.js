"use client";
import { Suspense } from "react";
import { CheckoutPage } from "@modules/membership";

export default function Page(props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
      <CheckoutPage {...props} />
    </Suspense>
  );
}
