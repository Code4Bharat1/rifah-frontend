import { AdminAudit } from "../../../modules/admin/components/admin-audit";

export const metadata = {
  title: "Audit Logs | Admin | RIFAH Connect",
  description: "System activity and admin actions",
};

export default function AuditPage() {
  return <AdminAudit />;
}
