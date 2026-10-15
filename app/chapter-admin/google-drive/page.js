import { GoogleDriveDashboard } from "@/modules/admin/components/google-drive/google-drive-dashboard";

export const metadata = {
  title: "Google Drive Archive | RIFAH Chapter Admin",
  description: "Shared administrative archive and synchronized platform spreadsheets.",
};

export default function GoogleDriveChapterAdminPage() {
  return <GoogleDriveDashboard expectedRole="chapter_admin" />;
}
