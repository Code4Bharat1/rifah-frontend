import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Documents | RIFAH Operations Center",
};

export default function DocumentsPage() {
  return (
    <AppShell role="chapter_admin" title="Documents & Formats" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="documents" />
    </AppShell>
  );
}
