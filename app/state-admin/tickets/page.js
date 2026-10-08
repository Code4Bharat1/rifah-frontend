import { AdminTicketsView } from "@modules/tickets/components/admin-tickets-view";

export const metadata = {
  title: "Support Tickets | State Administration | RIFAH Connect",
  description: "Manage, resolve, and escalate state-level business support tickets.",
};

export default function StateAdminTicketsPage() {
  return <AdminTicketsView role="state_admin" />;
}
