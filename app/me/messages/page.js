import { Suspense } from "react";
import { CustomerMessages } from "@modules/customer";

export default function Page(props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading messages...</div>}>
      <CustomerMessages {...props} />
    </Suspense>
  );
}
