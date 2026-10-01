import { Suspense } from "react";
import { BusinessProfilePage } from "@modules/business";

export default function Page(props) {
  return (
    <Suspense fallback={null}>
      <BusinessProfilePage {...props} />
    </Suspense>
  );
}
