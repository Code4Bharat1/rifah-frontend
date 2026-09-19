import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Entrance Desk | RIFAH Operations Center",
};

export default function EntranceDeskPage() {
  return (
    <AppShell role="chapter_admin" title="Entrance Desk" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="entrance-desk" />
    </AppShell>
  );
}
