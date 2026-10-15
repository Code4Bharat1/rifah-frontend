import { GoogleDriveDashboard } from "@/modules/admin/components/google-drive/google-drive-dashboard";

export const metadata = {
  title: "Google Drive Integration | RIFAH Central Admin",
  description: "Platform-wide Google Drive shared folder and Excel spreadsheet synchronization management.",
};

export default function GoogleDriveAdminPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <GoogleDriveDashboard />
    </div>
  );
}
