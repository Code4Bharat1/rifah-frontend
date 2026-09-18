import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "RIFAH Operations Center | Chapter Admin Panel",
};

export default function ChapterAdminPage(props) {
  return (
    <AppShell role="chapter_admin" title="Chapter Overview" subtitle="RIFAH Operations Center Admin Panel">
      <OperationsCenter initialTab="overview" {...props} />
    </AppShell>
  );
}
