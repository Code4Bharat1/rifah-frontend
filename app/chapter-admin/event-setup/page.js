import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Event Setup | RIFAH Operations Center",
};

export default function EventSetupPage() {
  return (
    <AppShell role="chapter_admin" title="Event Setup" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="event-setup" />
    </AppShell>
  );
}
