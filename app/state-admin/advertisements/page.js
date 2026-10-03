import { StateAdminAdvertisements } from "@modules/admin";

export const metadata = {
  title: "State Advertisements Desk | State Admin | RIFAH Connect",
  description: "Verify, set duration, and schedule member advertisements for your state.",
};

export default function Page(props) {
  return <StateAdminAdvertisements {...props} />;
}

export const dynamic = "force-dynamic";
