import { BizOperations } from "@modules/workspace/components/biz-operations";

export const metadata = {
  title: "Operations Center | Business Workspace | RIFAH Connect",
  description: "Your assigned event duties and the chamber event gallery.",
};

export default function BizOperationsPage() {
  return <BizOperations initialTab="my-duty" />;
}
