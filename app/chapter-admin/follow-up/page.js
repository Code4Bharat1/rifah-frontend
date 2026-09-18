import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Follow-up | RIFAH Operations Center",
};

export default function FollowUpPage() {
  return (
    <AppShell role="chapter_admin" title="Follow-up Command Desk" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="follow-up" />
    </AppShell>
  );
}
