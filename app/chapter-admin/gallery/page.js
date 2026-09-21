import { OperationsShell } from "@modules/admin/components/operations-center/operations-shell";

export const metadata = {
  title: "Gallery | RIFAH Operations Center",
};

export default function ChapterGalleryPage() {
  return <OperationsShell panel="chapter_admin" initialTab="gallery" />;
}
