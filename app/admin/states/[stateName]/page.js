import AdminStateDetails from "@modules/admin/components/admin-state-details";

export const metadata = {
  title: "State Details - Rifah Admin",
  description: "View state details and manage state administration",
};

export default async function StateDetailsPage({ params }) {
  // Await params in newer Next.js versions
  const resolvedParams = await params;
  const decodedStateName = decodeURIComponent(resolvedParams.stateName);

  return <AdminStateDetails stateName={decodedStateName} />;
}
