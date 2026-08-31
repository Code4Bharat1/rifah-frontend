/**
 * RIFAH Static UI Constants and Empty Collections
 * Live data is fetched from RIFAH Backend API via React Query hooks (@shared/hooks/use-rifah-api).
 */

export const accents = {
  0: "from-primary/90 to-primary/40",
  1: "from-navy/90 to-primary/40",
  2: "from-brand/80 to-navy/60",
  3: "from-primary/70 to-success/40",
};

// Static lookup lists for UI forms & filters
export const cities = [
  "Mumbai",
  "Pune",
  "Nagpur",
  "Aurangabad",
  "Nashik",
  "Hyderabad",
  "Bangalore",
  "New Delhi",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Lucknow",
];

export const industries = [
  "Manufacturing",
  "Wholesale & Distribution",
  "Information Technology",
  "Food & Hospitality",
  "Logistics & Transport",
  "Textiles & Apparel",
  "Healthcare & Pharma",
  "Construction & Real Estate",
  "Consulting & Professional Services",
  "Green Energy & Environment",
];

// Empty live data placeholders (all live data is provided by API hooks)
export const businesses = [];
export const catalogue = [];
export const chapters = [];
export const units = [];
export const enquiries = [];
export const events = [];
export const payments = [];
export const reviews = [];
export const auditLogs = [];
export const users = [];
export const notifications = [];
export const conversations = [];
export const adminTrend = [];
export const leadTrend = [];
export const categories = [];
export const savedBusinessIds = [];

export const membershipPlans = [
  {
    id: "free",
    name: "Free",
    price: "₹ 0",
    period: "forever",
    summary: "Basic directory listing to establish your digital chamber presence.",
    features: ["Directory listing", "Basic search presence", "Up to 5 lead enquiries / month"],
  },
  {
    id: "basic",
    name: "Basic",
    price: "₹ 4,999",
    period: "per year",
    summary: "For active MSMEs looking for verified credibility and standard enquiry flow.",
    features: ["Directory listing with Verified badge", "Up to 15 lead enquiries / month", "Catalogue listing (up to 5 items)", "Direct buyer messaging"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹ 12,999",
    period: "per year",
    highlight: true,
    summary: "Enhanced presentation, featured placement and priority lead routing.",
    features: ["Featured placement on home & directory", "Unlimited lead enquiries", "Full catalogue management", "Priority RFQ routing", "2 complimentary chapter event passes"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹ 29,999",
    period: "per year",
    summary: "For established corporations and multi-chapter operations.",
    features: ["All Premium features", "Multi-chapter directory exposure", "Direct secretariat trade advisory", "VIP delegate passes for annual summits", "Custom exhibition pavilion placement"],
  },
];

export function getBusiness(idOrSlug) {
  return businesses.find((b) => b.id === idOrSlug || b.slug === idOrSlug) || null;
}
