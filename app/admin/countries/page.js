// ==========================================
// [COUNTRY_MODULE_DISABLED]
// import { AdminCountries } from "@modules/admin/components/admin-countries";
//
// export const metadata = {
//   title: "Countries | Admin",
// };
//
// export default function CountriesPage() {
//   return <AdminCountries />;
// }
// ==========================================

import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin",
};

export default function CountriesPage() {
  redirect("/admin");
  return null;
}

