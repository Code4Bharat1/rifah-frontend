import { BizCatalogue } from "@modules/workspace";

export const metadata = {
  title: "My Catalogue | Member Portal | RIFAH Connect",
  description: "Manage and list your products and services according to your member subscription plan.",
};

export default function Page(props) {
  return <BizCatalogue role="user" {...props} />;
}
