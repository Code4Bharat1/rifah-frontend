import { BizLms } from "@modules/workspace";

export const metadata = {
  title: "Learning & LMS | RIFAH Connect",
  description: "Access curated business courses and executive learning modules.",
};

export default function Page(props) {
  return <BizLms role="user" {...props} />;
}
