import { GoogleDriveDashboard } from "@/modules/admin/components/google-drive/google-drive-dashboard";

export const metadata = {
  title: "Google Drive Archive | RIFAH State Admin",
  description: "Shared administrative archive and synchronized platform spreadsheets.",
};

export default function GoogleDriveStateAdminPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <GoogleDriveDashboard />
    </div>
  );
}
