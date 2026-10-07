// Single source of truth for which workspace ("/biz" or "/user") a signed-in account lives in,
// so shared components never hardcode "/biz" for member (subscriber) accounts.
const ADMIN_HOME = {
  central_admin: "/admin",
  super_admin: "/admin",
  admin: "/admin",
  secretariat: "/admin",
  state_admin: "/state-admin",
  chapter_admin: "/chapter-admin",
};

export function isBusinessAccount(user) {
  if (!user) return false;
  return (
    user.role === "business_owner" ||
    user.role === "business" ||
    user.accountType === "business" ||
    (user.accountType !== "user" && Boolean(user.businessId || user.businessSlug))
  );
}

// Workspace prefix for feature pages shared by business and member portals (messages, networking...).
export function workspacePrefix(user) {
  return isBusinessAccount(user) ? "/biz" : "/user";
}

export function homePath(user) {
  if (user && ADMIN_HOME[user.role]) return ADMIN_HOME[user.role];
  return workspacePrefix(user);
}
