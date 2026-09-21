import { redirect } from "next/navigation";

// "My Event Duty" now lives as a tab inside the business Operations Center.
export default function Page() {
  redirect("/biz/operations");
}
