import { use } from "react";
import { StateDetailPage } from "../../../modules/public/components/state-detail-page";

export const metadata = {
  title: "State Details - RIFAH Chamber of Commerce",
  description: "View chapters and details of this state secretariat.",
};

export default function StateRoute(props) {
  const params = use(props.params);
  return <StateDetailPage stateName={params.stateName} />;
}
