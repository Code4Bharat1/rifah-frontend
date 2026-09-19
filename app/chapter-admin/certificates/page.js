import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Certificates | RIFAH Operations Center",
};

export default function CertificatesPage() {
  return (
    <AppShell role="chapter_admin" title="Certificates" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="certificates" />
    </AppShell>
  );
}
