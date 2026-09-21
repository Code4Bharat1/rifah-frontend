import { OperationsShell } from "@modules/admin/components/operations-center/operations-shell";

export const metadata = {
  title: "Operations Center | RIFAH State Admin Panel",
};

export default function StateOperationsPage() {
  return <OperationsShell panel="state_admin" initialTab="event-setup" />;
}
