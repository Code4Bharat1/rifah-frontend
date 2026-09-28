# Implementation: Restore Feeds in State Admin Sidebar & Git Commit Analysis

## 1. Git Commit Investigation (Who Removed Feeds)

Git history analysis using `git log -L` and `git blame` on [shared/components/rifah/app-shell.jsx](file:///d:/nexcoreD/rifah/rifah-frontend/shared/components/rifah/app-shell.jsx):

| Event | Commit Hash | Author | Date | Commit Message |
|---|---|---|---|---|
| **Originally Added** | `7e57581de` | `karan <karankanakarajan@gmail.com>` | Sep 18, 2026 | `feat: add feeds page and workspace component with app shell navigation support` |
| **Removed From State Admin** | `3d86d55c` | `dev02-nexcore <dev02.nexcore@gmail.com>` | Sep 24, 2026 12:04:40 UTC | `feat: Refactor admin settings and role-based module access` |

### Git Commit Diff of Removal:
Commit `3d86d55c75275bb7af6e53792bb070fdc36b35e7`:
```diff
--- a/shared/components/rifah/app-shell.jsx
+++ b/shared/components/rifah/app-shell.jsx
@@ -152,24 +153,22 @@
   state_admin: {
     title: "State admin",
     primary: [
       { label: "Dashboard", to: "/state-admin", icon: Gauge },
       { label: "Operations Center", to: "/state-admin/operations", icon: Radio },
       { label: "Chapters", to: "/state-admin/chapters", icon: MapPinned },
       { label: "Members", to: "/state-admin/members", icon: Users },
       { label: "Businesses", to: "/state-admin/businesses", icon: Building2 },
       { label: "More", to: "/state-admin/settings", icon: LayoutGrid },
     ],
     more: [
-
-      { label: "Feeds", to: "/biz/feeds", icon: Compass },
       { label: "Business Analytics", to: "/state-admin/networking-analytics", icon: TrendingUp },
       { label: "Enquiries", to: "/state-admin/enquiries", icon: FileStack },
```

---

## 2. Changes Implemented

### A. Restored Feeds in `state_admin` Navigation
**File:** [shared/components/rifah/app-shell.jsx](file:///d:/nexcoreD/rifah/rifah-frontend/shared/components/rifah/app-shell.jsx)
Added `{ label: "Feeds", to: "/biz/feeds", icon: Compass }` to `roleNavs.state_admin.more`.

### B. Updated `BizFeeds` Role Resolution
**File:** [modules/workspace/components/biz-feeds.jsx](file:///d:/nexcoreD/rifah/rifah-frontend/modules/workspace/components/biz-feeds.jsx)
Passed the exact role for `state_admin` and `chapter_admin` so the sidebar resolves properly with accurate active link highlighting.

### C. Added Direct Route Pages
1. [app/state-admin/feeds/page.js](file:///d:/nexcoreD/rifah/rifah-frontend/app/state-admin/feeds/page.js) – Enables direct route navigation to `/state-admin/feeds`.
2. [app/chapter-admin/feeds/page.js](file:///d:/nexcoreD/rifah/rifah-frontend/app/chapter-admin/feeds/page.js) – Enables direct route navigation to `/chapter-admin/feeds`.
