import { ChapterAdminAdvertisements } from "@modules/admin";

export const metadata = {
  title: "Advertisements Desk | Chapter Admin | RIFAH Connect",
  description: "Verify, set duration, and schedule member advertisements for your chapter.",
};

export default function Page(props) {
  return <ChapterAdminAdvertisements {...props} />;
}

export const dynamic = "force-dynamic";
