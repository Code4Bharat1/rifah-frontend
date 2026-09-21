"use client";

// Every panel (central / state / chapter) mounts the same Operations Centre, but the
// shell around it must name the panel the signed-in admin is actually in — the header
// used to read "Central Admin" everywhere.
import { AppShell } from "@shared/components/rifah/app-shell";
import { OperationsCenter } from "@modules/admin/components/operations-center/operations-center";
import { useAuth } from "@shared/providers/auth-provider";

const PANEL_COPY = {
  central_admin: {
    role: "central_admin",
    subtitle: "RIFAH Central Admin Panel · all chapters",
  },
  state_admin: {
    role: "state_admin",
    subtitle: (user) => `RIFAH State Admin Panel · ${user?.state || "your state"}`,
  },
  chapter_admin: {
    role: "chapter_admin",
    subtitle: (user) => `RIFAH Chapter Admin Panel · ${user?.chapter || "your chapter"}`,
  },
};

/**
 * @param {string} panel - which panel's route this page belongs to; used until the
 *   signed-in user is known so the header does not flash the wrong label.
 */
export function OperationsShell({ panel = "chapter_admin", initialTab = "event-setup" }) {
  const { user } = useAuth();

  const key = PANEL_COPY[user?.role] ? user.role : panel;
  const copy = PANEL_COPY[key] || PANEL_COPY.chapter_admin;
  const subtitle = typeof copy.subtitle === "function" ? copy.subtitle(user) : copy.subtitle;

  return (
    <AppShell role={copy.role} title="Operations Center" subtitle={subtitle}>
      <OperationsCenter initialTab={initialTab} />
    </AppShell>
  );
}

export default OperationsShell;
