// Rifah Connect Subscriber Models Specification & Business Chamber Membership Tiers
// Zero emojis rule enforced - use Lucide icons for UI representation

export function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const BUSINESS_CHAMBER_TIERS = [
  {
    id: "silver",
    name: "Silver",
    tierKey: "silver",
    badge: "1 Year Validity",
    validityYears: 1,
    costingInr: 3000,
    gstInr: 540,
    costingUsd: 60,
    gstUsd: 10.8,
    period: "1 Year",
    category: "business",
    isPopular: false,
    subtitle: "1-Year Verified Chamber Membership",
    summary: "Basic Chamber Accreditation, official verified listing, and chapter networking for local businesses.",
    bulletPoints: [
      "Directory listing with Verified Chamber badge",
      "Up to 15 matched buyer lead enquiries",
      "Standard catalogue listing (up to 5 products)",
      "Local chapter business networking meets",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    tierKey: "gold",
    badge: "2 Years Validity",
    validityYears: 2,
    costingInr: 5000,
    gstInr: 900,
    costingUsd: 100,
    gstUsd: 18,
    period: "2 Years",
    category: "business",
    isPopular: false,
    subtitle: "2-Year Chamber Access & Direct Messaging",
    summary: "High priority visibility, State summits access, and enhanced product showcase for growing businesses.",
    bulletPoints: [
      "Directory listing with Verified Chamber Gold badge",
      "Up to 35 matched buyer lead enquiries",
      "Expanded catalogue listing (up to 15 products)",
      "State-level chamber conclaves & summits",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    tierKey: "platinum",
    badge: "10 Years Validity",
    validityYears: 10,
    costingInr: 25000,
    gstInr: 4500,
    costingUsd: 500,
    gstUsd: 90,
    period: "10 Years",
    category: "business",
    isPopular: true,
    badgeText: "Most Popular",
    subtitle: "10-Year Enterprise Patronage (Recommended)",
    summary: "Comprehensive multi-city access, Featured Business branding, and national expo privileges for established enterprises.",
    bulletPoints: [
      "Featured placement across Directory & Search",
      "Unlimited matched buyer lead enquiries",
      "Full commercial product & service showcase",
      "National trade delegations & expo passes",
    ],
  },
  {
    id: "diamond",
    name: "Diamond",
    tierKey: "diamond",
    badge: "25 Years Validity",
    validityYears: 25,
    costingInr: 50000,
    gstInr: 9000,
    costingUsd: 1000,
    gstUsd: 180,
    period: "25 Years",
    category: "business",
    isPopular: false,
    subtitle: "25-Year Prestige Chamber Patronage",
    summary: "Elite chamber patronage, international trade delegations, VIP expo passes, and dedicated corporate relationship manager.",
    bulletPoints: [
      "All Platinum features included",
      "25-Year Lifetime chamber patronage & VIP badge",
      "Unlimited verified buyer lead enquiries",
      "Global trade missions & international chapters",
    ],
  },
];

export const SUBSCRIBER_TIERS = [
  {
    id: "tier_1",
    tierKey: "tier_1",
    name: "Tier I (Free)",
    badge: "Free Starter",
    costingInr: 0,
    costingUsd: 0,
    period: "month",
    usersCount: 1,
    isPopular: false,
    colorScheme: "slate",
    subtitle: "0/- per month",
    summary: "Basic community discovery, browsing, and fundamental listing for new members.",
    features: {
      costing: "0",
      users: "1",
      chatbot_support: true,
      profile_listing: true,
      business_discovery: true,
      product_browsing: true,
      service_browsing: true,
      feed_check: true,
      feed_posting: false,
      chat: "0",
      networking_groups: false,
      enquiry_posting: "2",
      lead_unlock: "1",
      quotation_chat: false,
      meeting_request: false,
      meeting_accept: "Accessible",
      product_listing: "1",
      service_listing: "1",
      business_verification: false,
      featured_business: false,
      featured_products: false,
      priority_visibility: false,
      analytics: "Basic",
      lms: false,
      team_members: false,
      multiple_locations: false,
      support: false,
      carry_forward: false,
      event_notifications: false,
      event_announcements: false,
      whatsapp_integration: false,
      thank_you_note: true,
      language_support: true,
    },
    bulletPoints: [
      "Users: 1",
      "Feed Posting: None",
      "Direct Chat: None",
      "Inquiry Posting: 2",
      "Lead Unlock: 1",
      "Catalogue Products: 1",
      "Services Listing: 1",
    ],
  },
  {
    id: "tier_2",
    tierKey: "tier_2",
    name: "Tier II (Starter)",
    badge: "Essential",
    costingInr: 50,
    costingUsd: 1,
    period: "month",
    usersCount: 1,
    isPopular: false,
    colorScheme: "emerald",
    subtitle: "50/- per month",
    summary: "Active networking, 5 chats, 5 monthly posts, and 5 catalogue listings.",
    features: {
      costing: "50/- per month",
      users: "1",
      chatbot_support: true,
      profile_listing: true,
      business_discovery: true,
      product_browsing: true,
      service_browsing: true,
      feed_check: true,
      feed_posting: "5 per month",
      chat: "5",
      networking_groups: "5 join",
      enquiry_posting: "10",
      lead_unlock: "5",
      quotation_chat: "5",
      meeting_request: "5",
      meeting_accept: "Accessible",
      product_listing: "5",
      service_listing: "5",
      business_verification: false,
      featured_business: false,
      featured_products: false,
      priority_visibility: false,
      analytics: "Basic",
      lms: "Free Content",
      team_members: false,
      multiple_locations: false,
      support: "Standard",
      carry_forward: false,
      event_notifications: "5",
      event_announcements: "5",
      whatsapp_integration: false,
      thank_you_note: true,
      language_support: true,
    },
    bulletPoints: [
      "Users: 1",
      "Feed Posting: 5 per month",
      "Direct Chat: 5",
      "Join 5 Networking Groups",
      "Inquiry Posting: 10",
      "Lead Unlock: 5",
      "Catalogue Products: 5",
      "Services Listing: 5",
    ],
  },
  {
    id: "tier_3",
    tierKey: "tier_3",
    name: "Tier III (Growth)",
    badge: "Most Popular",
    costingInr: 100,
    costingUsd: 2,
    period: "month",
    usersCount: 1,
    isPopular: true,
    badgeText: "Most Popular",
    colorScheme: "blue",
    subtitle: "100/- per month",
    summary: "Featured visibility, WhatsApp alerts, 30 enquiries, 15 chats & advanced analytics.",
    features: {
      costing: "100/- per month",
      users: "1",
      chatbot_support: true,
      profile_listing: true,
      business_discovery: true,
      product_browsing: true,
      service_browsing: true,
      feed_check: true,
      feed_posting: "10 per month",
      chat: "15",
      networking_groups: "5 Join + Create",
      enquiry_posting: "30",
      lead_unlock: "15",
      quotation_chat: "20",
      meeting_request: "15",
      meeting_accept: "Accessible",
      product_listing: "10",
      service_listing: "10",
      business_verification: false,
      featured_business: true,
      featured_products: true,
      priority_visibility: true,
      analytics: "Advanced",
      lms: "Selected Content",
      team_members: "Limited",
      multiple_locations: "Limited",
      support: "Priority",
      carry_forward: true,
      event_notifications: "10",
      event_announcements: "10",
      whatsapp_integration: "Available",
      thank_you_note: true,
      language_support: true,
    },
    bulletPoints: [
      "Users: 1",
      "Feed Posting: 10 per month",
      "Direct Chat: 15",
      "Networking: 5 Join + Create",
      "Inquiry Posting: 30",
      "Lead Unlock: 15",
      "Catalogue Products: 10",
      "Featured Visibility: Yes",
    ],
  },
  {
    id: "tier_4",
    tierKey: "tier_4",
    name: "Tier IV (Enterprise)",
    badge: "Complete Scale",
    costingInr: 200,
    costingUsd: 3,
    period: "month",
    usersCount: 5,
    isPopular: false,
    colorScheme: "purple",
    subtitle: "200/- per month",
    summary: "Enterprise scale with 5 users, 20 posts/month, unlimited chats, leads, and catalogue listings.",
    features: {
      costing: "200/- per month",
      users: "5",
      chatbot_support: true,
      profile_listing: true,
      business_discovery: true,
      product_browsing: true,
      service_browsing: true,
      feed_check: true,
      feed_posting: "20 per month",
      chat: "Unlimited",
      networking_groups: "Unlimited Create+join",
      enquiry_posting: "Unlimited",
      lead_unlock: "Unlimited",
      quotation_chat: "Unlimited",
      meeting_request: "Unlimited",
      meeting_accept: "Accessible",
      product_listing: "Unlimited",
      service_listing: "Unlimited",
      business_verification: false,
      featured_business: true,
      featured_products: true,
      priority_visibility: true,
      analytics: "Enterprise",
      lms: "Full access",
      team_members: "Full",
      multiple_locations: "Available",
      support: "Priority",
      carry_forward: true,
      event_notifications: "Unlimited",
      event_announcements: "Unlimited",
      whatsapp_integration: "Available",
      thank_you_note: true,
      language_support: true,
    },
    bulletPoints: [
      "Users: 5",
      "Feed Posting: 20 per month",
      "Direct Chat: Unlimited",
      "Unlimited Create + Join Groups",
      "Inquiry Posting: Unlimited",
      "Lead Unlock: Unlimited",
      "Catalogue Products: Unlimited",
      "Featured Visibility: Yes",
    ],
  },
];

export const FEATURE_SPEC_DEFINITIONS = [
  { key: "costing", label: "Costing", category: "Pricing" },
  { key: "users", label: "Users", category: "Core Access" },
  { key: "chatbot_support", label: "Chatbot Support", category: "Core Access" },
  { key: "profile_listing", label: "Business Profile Listing", category: "Core Access" },
  { key: "business_discovery", label: "Business Discovery", category: "Core Access" },
  { key: "product_browsing", label: "Product Catalogue Browsing", category: "Core Access" },
  { key: "service_browsing", label: "Service Browsing", category: "Core Access" },
  { key: "feed_check", label: "General Feed Check", category: "Core Access" },
  { key: "feed_posting", label: "Feed Posting", category: "Engagement & Content" },
  { key: "chat", label: "Chat", category: "Engagement & Content" },
  { key: "networking_groups", label: "Networking Groups", category: "Engagement & Content" },
  { key: "enquiry_posting", label: "Enquiry Posting", category: "Leads & Commerce" },
  { key: "lead_unlock", label: "Accept & Unlock Lead", category: "Leads & Commerce" },
  { key: "quotation_chat", label: "Quotation Posting+Chat", category: "Leads & Commerce" },
  { key: "meeting_request", label: "One-to-One Meeting Request", category: "Networking" },
  { key: "meeting_accept", label: "One-to-One Meeting Accept", category: "Networking" },
  { key: "product_listing", label: "Catalogue Products Listing", category: "Catalogue" },
  { key: "service_listing", label: "Services Listing", category: "Catalogue" },
  { key: "business_verification", label: "Business Verification", category: "Trust & Compliance" },
  { key: "featured_business", label: "Featured Business", category: "Visibility & Marketing" },
  { key: "featured_products", label: "Featured Products", category: "Visibility & Marketing" },
  { key: "priority_visibility", label: "Priority Visibility", category: "Visibility & Marketing" },
  { key: "analytics", label: "Analytics", category: "Intelligence" },
  { key: "lms", label: "LMS", category: "Intelligence" },
  { key: "team_members", label: "Team Members Listing", category: "Enterprise", isHighlight: true },
  { key: "multiple_locations", label: "Multiple Locations Listing", category: "Enterprise" },
  { key: "support", label: "Support", category: "Enterprise" },
  { key: "carry_forward", label: "Carry Forward Plans", category: "Enterprise" },
  { key: "event_notifications", label: "Event Notifications", category: "Events" },
  { key: "event_announcements", label: "Event Announcement", category: "Events" },
  { key: "whatsapp_integration", label: "Whatsapp Integration", category: "Integrations" },
  { key: "thank_you_note", label: "Thank You Note", category: "Integrations" },
  { key: "language_support", label: "Language Support", category: "Integrations" },
];

/**
 * Normalizes user subscriber tier identifier.
 * Chamber members (Silver/Gold/Platinum/Diamond) without an explicit subscriber tier
 * are intentionally treated as "tier_1" (Free).
 */
export function normalizeUserTier(tierString) {
  if (!tierString) return "tier_1";
  const s = String(tierString).toLowerCase().trim();
  if (
    s.includes("tier iv") ||
    s.includes("tier 4") ||
    s.includes("tier_4") ||
    s.includes("tier-4") ||
    s === "enterprise"
  ) {
    return "tier_4";
  }
  if (
    s.includes("tier iii") ||
    s.includes("tier 3") ||
    s.includes("tier_3") ||
    s.includes("tier-3") ||
    s === "growth"
  ) {
    return "tier_3";
  }
  if (
    s.includes("tier ii") ||
    s.includes("tier 2") ||
    s.includes("tier_2") ||
    s.includes("tier-2") ||
    s === "starter"
  ) {
    return "tier_2";
  }
  return "tier_1";
}

/**
 * Checks if a specific workspace route / feature key is accessible for a user
 */
export function checkFeatureAccess(userPlanName, featureKey, isExpired = false) {
  if (isExpired) {
    return {
      isAllowed: false,
      isExpired: true,
      reason: "Subscription expired. Renew your plan to unlock this feature.",
    };
  }

  const tierId = normalizeUserTier(userPlanName);
  const tier = SUBSCRIBER_TIERS.find((t) => t.id === tierId) || SUBSCRIBER_TIERS[0];
  const value = tier.features[featureKey];

  if (value === false || value === "None" || value === "0" || value === undefined) {
    return {
      isAllowed: false,
      isExpired: false,
      value: value || "None",
      reason: `Locked on ${tier.name}. Upgrade to an advanced tier to unlock.`,
    };
  }

  return {
    isAllowed: true,
    isExpired: false,
    value,
    tierName: tier.name,
  };
}
