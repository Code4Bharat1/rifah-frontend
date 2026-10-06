import { CustomerEvents } from "@modules/customer/components/customer-events";

export const metadata = {
  title: "Events & Trade Meets | Customer Portal | RIFAH Connect",
  description: "Browse upcoming chamber meets, reserve seats, and manage event passes in the customer portal.",
};

export default function EventsPage() {
  return <CustomerEvents />;
}
