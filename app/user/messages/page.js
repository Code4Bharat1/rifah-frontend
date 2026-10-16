import { Suspense } from "react";
import { BizMessages } from "@modules/workspace";

export const metadata = {
  title: "Messages | RIFAH Connect",
  description: "Direct messaging with verified businesses and chamber partners.",
};

export default function Page(props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading messages...</div>}>
      <BizMessages role="user" {...props} />
    </Suspense>
  );
}
