import { GoogleDriveDashboard } from "@/modules/admin/components/google-drive/google-drive-dashboard";

export const metadata = {
  title: "Google Drive Archive | RIFAH State Admin",
  description: "Shared administrative archive and synchronized platform spreadsheets.",
};

export default function GoogleDriveStateAdminPage() {
  return <GoogleDriveDashboard expectedRole="state_admin" />;
}
