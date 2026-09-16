import { redirect } from "next/navigation";

export default function Page() {
  redirect("/biz/profile?tab=catalogue");
}

