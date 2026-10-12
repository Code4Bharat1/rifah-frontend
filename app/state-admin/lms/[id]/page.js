import { redirect } from "next/navigation";

export default function Page() {
  redirect("/state-admin");
}

export const dynamic = "force-dynamic";
