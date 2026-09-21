import { OperationsShell } from "@modules/admin/components/operations-center/operations-shell";

export const metadata = {
  title: "Operations Center | RIFAH Central Admin Panel",
};

export default function AdminOperationsPage() {
  return <OperationsShell panel="central_admin" initialTab="event-setup" />;
}
