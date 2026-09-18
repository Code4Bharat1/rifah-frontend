import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Live Control | RIFAH Operations Center",
};

export default function LiveControlPage() {
  return (
    <AppShell role="chapter_admin" title="Live Control" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="live-control" />
    </AppShell>
  );
}
