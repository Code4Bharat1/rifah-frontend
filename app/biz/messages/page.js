import { Suspense } from "react";
import { BizMessages } from "@modules/workspace";

export default function Page(props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading messages...</div>}>
      <BizMessages {...props} />
    </Suspense>
  );
}
