import { OperationsShell } from "@modules/admin/components/operations-center/operations-shell";

export const metadata = {
  title: "Operations Center | RIFAH Chapter Admin Panel",
};

export default function ChapterOperationsPage() {
  return <OperationsShell panel="chapter_admin" initialTab="event-setup" />;
}
