import StateAdminDashboard from "@modules/admin/components/state-admin-dashboard";

export const metadata = {
  title: "Chapters | RIFAH",
  description: "Executive desk for managing Chapters and appointing Chapter Admins across the state",
};

export default function StateAdminChaptersPage() {
  return <StateAdminDashboard isChaptersOnly={true} />;
}
