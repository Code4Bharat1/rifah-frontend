import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "My Links | RIFAH Operations Center",
};

export default function MyLinksPage() {
  return (
    <AppShell role="chapter_admin" title="My Chapter Links" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="my-links" />
    </AppShell>
  );
}
