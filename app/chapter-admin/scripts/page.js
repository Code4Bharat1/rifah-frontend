import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Scripts | RIFAH Operations Center",
};

export default function ScriptsPage() {
  return (
    <AppShell role="chapter_admin" title="Event Scripts" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="scripts" />
    </AppShell>
  );
}
