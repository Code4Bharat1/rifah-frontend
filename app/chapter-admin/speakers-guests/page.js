import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";

export const metadata = {
  title: "Speakers & Guests | RIFAH Operations Center",
};

export default function SpeakersGuestsPage() {
  return (
    <AppShell role="chapter_admin" title="Speakers & Guests" subtitle="RIFAH Operations Center">
      <OperationsCenter initialTab="speakers-guests" />
    </AppShell>
  );
}
