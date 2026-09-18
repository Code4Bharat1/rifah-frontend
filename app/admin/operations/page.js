import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Operations Center | RIFAH Operations Center Admin Panel",
};

export default function AdminOperationsPage(props) {
  return (
    <AppShell role="chapter_admin" title="Operations Center" subtitle="RIFAH Operations Center Admin Panel">
      <OperationsCenter initialTab="event-setup" {...props} />
    </AppShell>
  );
}
