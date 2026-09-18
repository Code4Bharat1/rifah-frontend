import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "My Team | RIFAH Operations Center",
};

export default function MyTeamPage() {
  return (
    <AppShell role="chapter_admin" title="My Team" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="my-team" />
    </AppShell>
  );
}
