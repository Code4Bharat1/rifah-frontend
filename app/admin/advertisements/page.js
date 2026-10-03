import { CentralAdminAdvertisements } from "@modules/admin";

export const metadata = {
  title: "Central Advertisements Desk | RIFAH Central Administration",
  description: "Verify, set duration, and schedule platform-wide member advertisements.",
};

export default function Page(props) {
  return <CentralAdminAdvertisements {...props} />;
}

export const dynamic = "force-dynamic";
