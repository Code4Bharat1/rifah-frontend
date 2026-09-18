import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Finance | RIFAH Operations Center",
};

export default function FinancePage() {
  return (
    <AppShell role="chapter_admin" title="Finance" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="finance" />
    </AppShell>
  );
}
