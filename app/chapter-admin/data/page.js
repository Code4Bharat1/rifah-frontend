import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Data & Reports | RIFAH Operations Center",
};

export default function DataPage() {
  return (
    <AppShell role="chapter_admin" title="Data Central" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="data" />
    </AppShell>
  );
}
