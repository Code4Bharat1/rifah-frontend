import StateAdminDashboard from "@modules/admin/components/state-admin-dashboard";

export const metadata = {
  title: "Chapter Admin Management | RIFAH",
  description: "Executive desk for appointing and managing Chapter Admins across the state",
};

export default function StateAdminChaptersPage() {
  return <StateAdminDashboard isChaptersOnly={true} />;
}
