import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Attendees | RIFAH Operations Center",
};

export default function AttendeesPage() {
  return (
    <AppShell role="chapter_admin" title="Attendees" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="attendees" />
    </AppShell>
  );
}
