import { AdminTicketsView } from "@modules/tickets/components/admin-tickets-view";

export const metadata = {
  title: "Support Tickets | Central Administration | RIFAH Connect",
  description: "Global support tickets management and central chamber resolution.",
};

export default function CentralAdminTicketsPage() {
  return <AdminTicketsView role="central_admin" />;
}
