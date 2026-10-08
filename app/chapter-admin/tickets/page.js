import { AdminTicketsView } from "@modules/tickets/components/admin-tickets-view";

export const metadata = {
  title: "Support Tickets | Chapter Administration | RIFAH Connect",
  description: "Manage, resolve, and escalate chapter business support tickets.",
};

export default function ChapterAdminTicketsPage() {
  return <AdminTicketsView role="chapter_admin" />;
}
