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
    subtitle: "1 User Included",
    summary: "Basic community discovery, browsing, and fundamental listing for new members.",
    features: {
      users: "1",
      chatbot_support: true,
      profile_listing: true,
      business_discovery: true,
      product_browsing: true,
      service_browsing: true,
      feed_check: true,
      feed_posting: "None",
      chat: "None",
      networking_groups: "None",
      enquiry_posting: "2",
      lead_unlock: "1",
      quotation_chat: "None",
      meeting_request: "None",
      meeting_accept: false,
      product_listing: "1",
      service_listing: "1",
      business_verification: false,
      featured_business: false,
      featured_products: false,
      priority_visibility: false,
      analytics: "Basic",
      lms: "None",
      team_members: "None",
      multiple_locations: "None",
      support: "None",
      carry_forward: false,
      event_notifications: "None",
      event_announcements: "None",
      whatsapp_integration: false,
      thank_you_note: true,
      language_support: true,
    },
    bulletPoints: [
      "Feed Posting: None",
      "Direct Chat: None",
      "Inquiry Posting: 2",
      "Lead Unlock: 1",
      "Catalogue Products: 1",
      "Featured Visibility: No",
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
    subtitle: "1 User Included",
    summary: "Active networking, lead unlock access, 5 monthly posts and direct chat engagements.",
    features: {
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
      team_members: "None",
      multiple_locations: "None",
      support: "Standard",
      carry_forward: false,
      event_notifications: "5",
      event_announcements: "5",
      whatsapp_integration: false,
      thank_you_note: true,
      language_support: true,
    },
    bulletPoints: [
      "Feed Posting: 5 per month",
      "Direct Chat: 5",
      "Inquiry Posting: 10",
      "Lead Unlock: 5",
      "Catalogue Products: 5",
      "Featured Visibility: No",
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
    subtitle: "1 User Included",
    summary: "Featured visibility, WhatsApp alerts, 30 enquiries, 15 leads & advanced business.",
    features: {
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
      lms: "Selected",
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
      "Feed Posting: 10 per month",
      "Direct Chat: 15",
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
    subtitle: "5 Team Users Included",
    summary: "5 team seats, unlimited leads, unlimited chats, full LMS, and dedicated priority support.",
    features: {
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
      lms: "Full",
      team_members: "Full",
      multiple_locations: true,
      support: "Priority",
      carry_forward: true,
      event_notifications: "Unlimited",
      event_announcements: "Unlimited",
      whatsapp_integration: "Available",
      thank_you_note: true,
      language_support: true,
    },
    bulletPoints: [
      "Feed Posting: 20 per month",
      "Direct Chat: Unlimited",
      "Inquiry Posting: Unlimited",
      "Lead Unlock: Unlimited",
      "Catalogue Products: Unlimited",
      "Featured Visibility: Yes",
    ],
  },
];

export const FEATURE_SPEC_DEFINITIONS = [
  { key: "users", label: "Users / Seats", category: "Core Access" },
  { key: "chatbot_support", label: "Chatbot Support", category: "Core Access" },
  { key: "profile_listing", label: "Business Profile Listing", category: "Core Access" },
  { key: "business_discovery", label: "Business Discovery", category: "Core Access" },
  { key: "product_browsing", label: "Product Catalogue Browsing", category: "Core Access" },
  { key: "service_browsing", label: "Service Browsing", category: "Core Access" },
  { key: "feed_check", label: "General Feed Check", category: "Core Access" },
  { key: "feed_posting", label: "Feed Posting", category: "Engagement & Content" },
  { key: "chat", label: "Direct Chat", category: "Engagement & Content" },
  { key: "networking_groups", label: "Networking Groups", category: "Engagement & Content" },
  { key: "enquiry_posting", label: "Enquiry Posting", category: "Leads & Commerce" },
  { key: "lead_unlock", label: "Accept & Unlock Lead", category: "Leads & Commerce" },
  { key: "quotation_chat", label: "Quotation Posting + Chat", category: "Leads & Commerce" },
  { key: "meeting_request", label: "1-to-1 Meeting Request", category: "Networking" },
  { key: "meeting_accept", label: "1-to-1 Meeting Accept", category: "Networking" },
  { key: "product_listing", label: "Catalogue Products Listing", category: "Catalogue" },
  { key: "service_listing", label: "Services Listing", category: "Catalogue" },
  { key: "business_verification", label: "Business Verification", category: "Trust & Compliance" },
  { key: "featured_business", label: "Featured Business Badge", category: "Visibility & Marketing" },
  { key: "featured_products", label: "Featured Products", category: "Visibility & Marketing" },
  { key: "priority_visibility", label: "Priority Visibility", category: "Visibility & Marketing" },
  { key: "analytics", label: "Analytics Level", category: "Intelligence" },
  { key: "lms", label: "LMS & Learning Content", category: "Intelligence" },
  { key: "team_members", label: "Team Members Listing", category: "Enterprise" },
  { key: "multiple_locations", label: "Multiple Locations Listing", category: "Enterprise" },
  { key: "support", label: "Customer Support Desk", category: "Enterprise" },
  { key: "carry_forward", label: "Carry Forward Plans", category: "Enterprise" },
  { key: "event_notifications", label: "Event Notifications", category: "Events" },
  { key: "event_announcements", label: "Event Announcements", category: "Events" },
  { key: "whatsapp_integration", label: "WhatsApp Integration", category: "Integrations" },
  { key: "thank_you_note", label: "Thank You Note", category: "Integrations" },
  { key: "language_support", label: "Language Support", category: "Integrations" },
];

/**
 * Normalizes user membership tier identifier
 */
export function normalizeUserTier(tierString) {
  if (!tierString) return "tier_1";
  const s = String(tierString).toLowerCase().trim();
  if (
    s.includes("diamond") ||
    s.includes("platinum") ||
    s.includes("tier iv") ||
    s.includes("tier 4") ||
    s.includes("tier_4") ||
    s.includes("tier-4") ||
    s.includes("enterprise")
  ) {
    return "tier_4";
  }
  if (
    s.includes("gold") ||
    s.includes("tier iii") ||
    s.includes("tier 3") ||
    s.includes("tier_3") ||
    s.includes("tier-3") ||
    s.includes("growth")
  ) {
    return "tier_3";
  }
  if (
    s.includes("silver") ||
    s.includes("tier ii") ||
    s.includes("tier 2") ||
    s.includes("tier_2") ||
    s.includes("tier-2") ||
    s.includes("starter")
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

  if (value === false || value === "None" || value === undefined) {
    return {
      isAllowed: false,
      isExpired: false,
      value: "None",
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
