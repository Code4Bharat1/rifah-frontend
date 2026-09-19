import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Ask & Give | RIFAH Operations Center",
};

export default function AskGivePage() {
  return (
    <AppShell role="chapter_admin" title="Ask & Give Board" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="ask-give" />
    </AppShell>
  );
}
