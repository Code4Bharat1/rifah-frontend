import { redirect } from "next/navigation";

export default function Page() {
  redirect("/chapter-admin");
}

export const dynamic = "force-dynamic";
