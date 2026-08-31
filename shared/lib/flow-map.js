 












export const roles




 = [
  {
    id: "public",
    title: "Public Visitor",
    blurb: "Discover businesses, products, services and events.",
    tone: "primary",
  },
  {
    id: "customer",
    title: "Customer / Buyer",
    blurb: "Search, enquire, track requests, communicate and review.",
    tone: "brand",
  },
  {
    id: "business",
    title: "Business / Member",
    blurb: "Create business presence, manage catalogue, receive leads and communicate.",
    tone: "success",
  },
  {
    id: "admin",
    title: "RIFAH Admin",
    blurb: "Verify, manage, monitor and control the ecosystem.",
    tone: "navy",
  },
];

export const coreFlow = [
  {
    id: "buyer",
    label: "Customer / Buyer",
    role: "customer",
    emphasis: 1,
    what: "A buyer with a sourcing requirement enters the ecosystem.",
    who: "Customer / Buyer",
    next: "Discover businesses across the chamber network.",
  },
  {
    id: "discover",
    label: "Discover",
    role: "public",
    what: "Browse the chamber directory, featured members, categories and chapters.",
    who: "Public visitor and buyer",
    next: "Refine intent through search.",
  },
  {
    id: "search",
    label: "Search",
    role: "public",
    what: "Keyword, category, location and verification-based search with filters.",
    who: "Public visitor and buyer",
    next: "Open a business, product or service result.",
  },
  {
    id: "result",
    label: "Business / Product / Service",
    role: "public",
    what: "Result cards for member businesses and their catalogue items.",
    who: "Public visitor and buyer",
    next: "Open the full business profile.",
  },
  {
    id: "profile",
    label: "Business Profile",
    role: "public",
    what: "Trust signals, catalogue, gallery, certifications, reviews and contact actions.",
    who: "Public visitor and buyer",
    next: "Send an enquiry to the business.",
  },
  {
    id: "enquiry",
    label: "Send Enquiry",
    role: "customer",
    emphasis: 2,
    what: "Submit a business requirement with quantity, timeline and location.",
    who: "Customer / Buyer",
    next: "RIFAH routes the requirement to relevant businesses.",
  },
  {
    id: "routing",
    label: "RIFAH Lead Routing",
    role: "admin",
    emphasis: 3,
    toConfirm: true,
    what: "The requirement is matched to relevant member businesses by category, location and membership tier.",
    who: "RIFAH platform / secretariat",
    next: "Matched businesses receive the lead.",
  },
  {
    id: "matched",
    label: "Relevant Businesses",
    role: "business",
    toConfirm: true,
    what: "Matched members see the lead in their workspace inbox.",
    who: "Business / Member",
    next: "Business reviews and responds.",
  },
  {
    id: "response",
    label: "Business Response",
    role: "business",
    emphasis: 4,
    what: "The member sends a quotation or a clarifying response to the buyer.",
    who: "Business / Member",
    next: "Direct communication opens between both parties.",
  },
  {
    id: "communication",
    label: "Communication",
    role: "customer",
    emphasis: 5,
    what: "In-platform messaging thread tied to the enquiry, with notifications.",
    who: "Buyer and Business",
    next: "Lead moves through its pipeline stages.",
  },
  {
    id: "progression",
    label: "Lead Progression",
    role: "business",
    toConfirm: true,
    what: "Lead status advances: new, in progress, responded, negotiation, won or closed.",
    who: "Business / Member, monitored by Admin",
    next: "Record the outcome.",
  },
  {
    id: "outcome",
    label: "Outcome",
    role: "customer",
    what: "Deal won, closed or archived; buyer can leave a moderated review.",
    who: "Buyer and Business",
    next: "Reviews and analytics feed back into discovery.",
  },
];

export const ecosystem = [
  {
    title: "Customer / Buyer",
    role: "customer",
    items: [
      "Discover",
      "Search",
      "Business Profile",
      "Save Business",
      "Send Enquiry",
      "Track Enquiry",
      "Receive Responses",
      "Messaging",
      "Reviews",
      "Events",
      "Notifications",
    ],
  },
  {
    title: "RIFAH Connect",
    role: "admin",
    items: [
      "Business Directory",
      "Search & Discovery",
      "Membership",
      "Lead Routing",
      "Enquiries",
      "Messaging",
      "Events",
      "Reviews",
      "Notifications",
    ],
  },
  {
    title: "Business / Member",
    role: "business",
    items: [
      "Registration",
      "Verification",
      "Membership",
      "Business Profile",
      "Products",
      "Services",
      "Leads",
      "Enquiries",
      "Messaging",
      "Reviews",
      "Notifications",
    ],
  },
];

export const buyerJourney = [
  { no: "01", label: "Discover", detail: "Enter through the directory, categories, chapters or events." },
  { no: "02", label: "Search", detail: "Filter by category, location, verification and membership tier." },
  { no: "03", label: "Evaluate", detail: "Compare business profiles, catalogue, certifications and reviews." },
  { no: "04", label: "Enquire", detail: "Send a requirement to one or more businesses.", toConfirm: true },
  { no: "05", label: "Match", detail: "RIFAH routes the requirement to relevant members.", toConfirm: true },
  { no: "06", label: "Respond", detail: "Businesses reply with quotations or clarifications." },
  { no: "07", label: "Communicate", detail: "Message, compare responses and negotiate." },
  { no: "08", label: "Close", detail: "Track the request to outcome and review the supplier." },
];

export const businessJourney = [
  { label: "Register", detail: "Business owner creates an account on RIFAH Connect." },
  { label: "Business Information", detail: "Legal name, categories, chapter, address, contacts." },
  { label: "Verification", detail: "Submit documents for secretariat vetting.", toConfirm: true },
  { label: "Membership", detail: "Choose a plan and complete payment.", toConfirm: true },
  { label: "Create Profile", detail: "About, gallery, certifications, service areas." },
  { label: "Add Products / Services", detail: "Build the catalogue used by search and matching." },
  { label: "Publish", detail: "Profile goes live in the directory." },
  { label: "Receive Enquiry", detail: "Direct enquiries sent to this business." },
  { label: "Receive Lead", detail: "Routed requirements matched by the platform.", toConfirm: true },
  { label: "Respond", detail: "Send quotation or request more detail." },
  { label: "Communicate", detail: "Messaging thread with the buyer." },
  { label: "Manage Lead", detail: "Move the lead through pipeline statuses.", toConfirm: true },
  { label: "Close", detail: "Mark won, lost or closed; collect a review." },
];

export const adminJourney = [
  { label: "Admin Login", detail: "Secretariat access to the control layer." },
  { label: "Dashboard", detail: "Membership, verification, lead and revenue overview." },
  { label: "Businesses", detail: "Directory moderation, suspension, feature placement." },
  { label: "Verification", detail: "Document review, approve, request correction, reject." },
  { label: "Memberships", detail: "Tiers, renewals, upgrades and expiry monitoring." },
  { label: "Leads / Enquiries", detail: "Chamber-wide enquiry flow and manual routing." },
  { label: "Reviews", detail: "Moderation queue for buyer feedback." },
  { label: "Events", detail: "Programme calendar, registrations and attendance." },
  { label: "Chapters / Units", detail: "Regional chapters and specialised business units." },
  { label: "Payments", detail: "Revenue ledger, invoices and transaction monitoring." },
  { label: "Reports", detail: "Registrations, chapter performance and platform analytics." },
];

export const modules = [
  { group: "Discovery", role: "public", items: ["Business Directory", "Search", "Filters", "Products", "Services"] },
  { group: "Business", role: "business", items: ["Registration", "Verification", "Business Profile", "Catalogue"] },
  { group: "Membership", role: "business", items: ["Plans", "Purchase", "Renewal", "Subscription Status"] },
  { group: "Lead Generation", role: "customer", items: ["Enquiries", "Lead Routing", "Lead Management", "Lead Status"] },
  { group: "Communication", role: "customer", items: ["Messaging", "Notifications"] },
  { group: "Events", role: "public", items: ["Event Listing", "Event Details", "Registration", "Payment", "Reminders"] },
  { group: "Trust", role: "admin", items: ["Verification", "Reviews", "Ratings"] },
  {
    group: "Administration",
    role: "admin",
    items: ["Users", "Businesses", "Memberships", "Chapters", "Units", "Events", "Leads", "Reports"],
  },
];

export const checklistItems = [
  "Business discovery",
  "Customer / Buyer flow",
  "Business registration",
  "Business verification",
  "Membership",
  "Business profile",
  "Products & Services",
  "Enquiry",
  "Lead generation",
  "Messaging",
  "Events",
  "Reviews",
  "Notifications",
  "Payments",
  "Admin",
  "Chapters / Units",
  "Reports",
];

export const openQuestions = [
  {
    group: "Buyer",
    questions: [
      "Is the Buyer always required to register before submitting an enquiry?",
      "Can a non-member submit an enquiry?",
      "Can one enquiry be sent to multiple businesses?",
      "Can the Buyer compare responses?",
    ],
  },
  {
    group: "Business",
    questions: [
      "What membership plans will exist?",
      "What benefits belong to each plan?",
      "What determines lead visibility?",
      "What information is mandatory during verification?",
    ],
  },
  {
    group: "Leads",
    questions: [
      "What exact lead statuses should be used?",
      "Who determines matching / routing?",
      "Can businesses reject leads?",
    ],
  },
  {
    group: "Payments",
    questions: [
      "Which payment gateway?",
      "Which activities require payment?",
      "Are membership renewals recurring?",
    ],
  },
  {
    group: "Events",
    questions: [
      "Which events are paid?",
      "Who manages events?",
      "Are event registrations available to non-members?",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Clickable block details
 * Every block on the flow map opens a panel with sample data so the
 * client can see what the screen behind it will actually contain.
 * ------------------------------------------------------------------ */

 












const seeds = {
  "Public Visitor": {
    what: "Anyone can browse the directory, catalogue and events without an account.",
    who: "Unregistered visitors, buyers researching suppliers, chamber guests.",
    next: "Register as a buyer, or send an enquiry after sign-in.",
    data: [
      { label: "Public pages", value: "Home, Directory, Catalogue, Events, Membership, Contact" },
      { label: "Visible sample members", value: "Bakka Bags, Smart India Enterprises, Lucky Masale" },
      { label: "Gated actions", value: "Enquiry, messaging, saving a business" },
    ],
  },
  "Customer / Buyer": {
    what: "A buyer with a sourcing requirement searches, shortlists and raises enquiries.",
    who: "Procurement buyers, retailers, institutions, corporate gifting teams.",
    next: "Enquiry is submitted and routed to matching members.",
    data: [
      { label: "Sample buyer", value: "Rehan Qureshi · Retail chain, Mumbai" },
      { label: "Open enquiries", value: "ENQ-2041 · 5,000 school bags (Bakka Bags shortlisted)" },
      { label: "Saved suppliers", value: "Bakka Bags, Lucky Masale" },
      { label: "Dashboard", value: "/me — enquiries, messages, saved, events" },
    ],
  },
  "Business / Member": {
    what: "A chamber member publishes a verified profile and catalogue, then works incoming leads.",
    who: "RIFAH member businesses and their staff.",
    next: "Receive matched leads and respond with a quote.",
    data: [
      { label: "Sample member", value: "Bakka Bags — Premium · Verified · Mumbai Chapter" },
      { label: "Catalogue", value: "School Bags, Laptop Backpacks, Trolley Bags, Jute Bags" },
      { label: "This month", value: "18 leads · 7 responded · 2 closed" },
      { label: "Workspace", value: "/biz — leads, catalogue, analytics, membership" },
    ],
  },
  "RIFAH Admin": {
    what: "The secretariat verifies members, routes leads, manages memberships and monitors the ecosystem.",
    who: "RIFAH Secretariat and chapter coordinators.",
    next: "Approve verification, publish listings, review reports.",
    data: [
      { label: "Members", value: "875 listed businesses across 6 chapters" },
      { label: "Verification queue", value: "24 pending — incl. Lucky Masale (documents under review)" },
      { label: "Payments this month", value: "41 collected · 2 failed" },
      { label: "Console", value: "/admin — businesses, users, leads, reports, audit" },
    ],
  },
  Discover: {
    what: "Category, chapter and featured-member browsing across the chamber directory.",
    who: "Public visitors and buyers.",
    next: "Refine with search and filters.",
    data: [
      { label: "Featured", value: "Bakka Bags · Smart India Enterprises · Lucky Masale" },
      { label: "Top categories", value: "Bags & Luggage, Electricals, Spices & Masala, Textiles" },
    ],
  },
  Search: {
    what: "Keyword, category, city and verification filters over members and catalogue items.",
    who: "Public visitors and buyers.",
    next: "Open a business, product or service result.",
    data: [
      { label: "Example query", value: '"school bags Mumbai verified" → Bakka Bags' },
      { label: "Filters", value: "Category · City · Chapter · Membership tier · Verified only" },
    ],
  },
  "Business Profile": {
    what: "The member's public page: overview, catalogue, gallery, certifications, reviews and enquiry action.",
    who: "Buyers evaluating a supplier.",
    next: "Send an enquiry or message the member.",
    data: [
      { label: "Sample profile", value: "Bakka Bags — 4.7★ (42 reviews) · Est. 2011 · 50–120 staff" },
      { label: "Trust signals", value: "RIFAH Verified · Premium member · MSME Udyam" },
      { label: "Actions", value: "Send enquiry · Message · Save · Share" },
    ],
  },
  "Products / Services": {
    what: "Catalogue items published by members, searchable independently of the business listing.",
    who: "Buyers and public visitors.",
    next: "Enquire against a specific item.",
    data: [
      { label: "Products", value: "Laptop Backpacks (Bakka) · Garam Masala 25kg (Lucky) · Wires & Cables (Smart India)" },
      { label: "Services", value: "Custom Branding · Private Label Packing · Rate Contracts" },
    ],
  },
  Enquiry: {
    what: "Structured requirement capture: product, quantity, budget, timeline, delivery location.",
    who: "Buyers (sign-in required).",
    next: "RIFAH routes the enquiry as leads to matching members.",
    data: [
      { label: "Sample enquiry", value: "ENQ-2041 · 5,000 school bags · Mumbai · in 30 days" },
      { label: "Captured fields", value: "Category, quantity, budget band, delivery city, deadline" },
      { label: "Status flow", value: "New → Routed → Responded → In discussion → Closed" },
    ],
  },
  "Lead Routing": {
    toConfirm: true,
    what: "Matching logic assigns each enquiry to relevant verified members by category, city and tier.",
    who: "Platform logic with secretariat override.",
    next: "Members receive the lead in their workspace.",
    data: [
      { label: "Match example", value: "ENQ-2041 → Bakka Bags, 2 other bag manufacturers" },
      { label: "Proposed rules", value: "Category + city + verified + membership tier priority" },
      { label: "To confirm", value: "Lead caps per tier, manual vs automatic routing" },
    ],
  },
  Response: {
    what: "The member replies with a quote, availability and terms against the lead.",
    who: "Business / member.",
    next: "Conversation continues in messaging.",
    data: [
      { label: "Sample response", value: "Bakka Bags · ₹Quote sent · 3 sample images attached" },
      { label: "Response SLA", value: "Target 24 hours (to confirm)" },
    ],
  },
  Messaging: {
    what: "Buyer–member conversation thread tied to the enquiry, with the secretariat able to assist.",
    who: "Buyers, members, admin.",
    next: "Close the deal offline or mark the enquiry closed.",
    data: [
      { label: "Sample thread", value: "Rehan Qureshi ↔ Bakka Bags · 6 messages" },
      { label: "Attachments", value: "Specs, quotes, sample photos" },
    ],
  },
  Businesses: {
    what: "Master list of member businesses with tier, chapter and verification state.",
    who: "RIFAH Admin.",
    next: "Verify, edit or suspend a listing.",
    data: [
      { label: "Verified", value: "Bakka Bags · Smart India Enterprises" },
      { label: "Pending", value: "Lucky Masale — FSSAI certificate under review" },
      { label: "Total", value: "875 businesses" },
    ],
  },
  Memberships: {
    what: "Free, Basic, Premium and Enterprise tiers with benefits, pricing and renewals.",
    who: "Members and admin.",
    next: "Checkout, invoice and tier activation.",
    data: [
      { label: "Sample tiers", value: "Bakka Bags · Premium · renews Mar 2026" },
      { label: "Mix", value: "Enterprise 42 · Premium 331 · Basic 288 · Free 211" },
    ],
  },
  Events: {
    what: "Chamber events, trade meets and workshops with registration tracking.",
    who: "All roles.",
    next: "Register, attend, follow up on connections.",
    data: [
      { label: "Upcoming", value: "RIFAH Trade Connect Meet · MSME Growth Forum" },
      { label: "Registered members", value: "Bakka Bags (2 seats), Lucky Masale (1 seat)" },
    ],
  },
  Business: {
    what: "The member receiving and working the routed lead.",
    who: "Business / member.",
    next: "Send a response to the buyer.",
    data: [
      { label: "Sample", value: "Bakka Bags — 18 leads this month" },
      { label: "Lead actions", value: "Accept · Quote · Decline · Ask a question" },
    ],
  },
  "Business / Product / Service": {
    what: "Search result cards for members and their catalogue items.",
    who: "Public visitors and buyers.",
    next: "Open the full profile or item detail.",
    data: [
      { label: "Result example", value: "Bakka Bags · Bags & Luggage · Mumbai · Verified" },
      { label: "Card shows", value: "Rating, tier, city, top categories, enquiry button" },
    ],
  },
};

const kindCopy = {
  module: {
    what: (l, g) => `${l} is a platform module inside the ${g ?? "core"} area of RIFAH Connect.`,
    who: "Depends on the module owner — buyer, member or secretariat.",
    next: "Detailed screens for this module come in the UI/UX design phase.",
  },
  ecosystem: {
    what: (l, g) => `${l} sits on the ${g ?? "platform"} side of the three-sided ecosystem.`,
    who: "Buyers, members and the secretariat interact through this capability.",
    next: "Validate that this capability belongs in the MVP.",
  },
  journey: {
    what: (l) => `${l} is a step in this role's end-to-end journey.`,
    who: "The role that owns this journey.",
    next: "Continue to the next journey step.",
  },
  map: {
    what: (l) => `${l} is a node in the system connection map.`,
    who: "Connected roles as shown by the arrows.",
    next: "Follow the arrow to the next node.",
  },
};

const sampleFallback = [
  { label: "Sample members", value: "Bakka Bags · Smart India Enterprises · Lucky Masale" },
  { label: "Prototype status", value: "Structure agreed here, screens designed next" },
];

export function getBlockDetail(
  label,
  opts





,
) {
  const seed = seeds[label] ?? {};
  const fallbackCopy = kindCopy["module"];
  const copy = kindCopy[opts.kind ?? "module"] ?? fallbackCopy;
  return {
    title: seed.title ?? label,
    kind: opts.kind === "journey" ? "Journey step" : opts.kind === "map" ? "System node" : opts.kind === "ecosystem" ? "Ecosystem capability" : opts.kind === "flow" ? "Flow step" : "Module",
    role: seed.role ?? opts.role,
    toConfirm: seed.toConfirm ?? opts.toConfirm,
    what: seed.what ?? opts.detail ?? copy.what(label, opts.group),
    who: seed.who ?? copy.who,
    next: seed.next ?? copy.next,
    data: seed.data ?? sampleFallback,
  };
}
