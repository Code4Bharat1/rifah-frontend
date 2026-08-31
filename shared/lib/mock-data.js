/**
 * Demo data for the RIFAH Connect prototype.
 * All records are illustrative placeholders — not real RIFAH members or figures.
 */

 































const accents = {
  0: "from-primary/90 to-primary/40",
  1: "from-navy/90 to-primary/40",
  2: "from-brand/80 to-navy/60",
  3: "from-primary/70 to-success/40",
} ;

export const businesses = [
  {
    id: "bakka-bags",
    name: "Bakka Bags",
    tagline: "School bags, backpacks and travel luggage manufacturer",
    about:
      "Bakka Bags, led by Aslam sir, manufactures and wholesales school bags, laptop backpacks, duffels and travel luggage for retailers, institutions and corporate gifting buyers. In-house stitching, printing and quality checks with bulk order capacity.",
    industry: "Manufacturing",
    categories: ["Bags & Luggage", "School & Office Supplies", "Corporate Gifting"],
    businessType: "Proprietorship",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Unit 7, Bag Market Lane, Kurla",
    chapter: "Mumbai Chapter",
    membership: "Premium",
    verification: "verified",
    rating: 4.7,
    reviews: 42,
    employees: "50–120",
    founded: "2011",
    website: "example.com/bakka-bags",
    phone: "+91 90000 00001",
    email: "sales@bakkabags.example",
    hours: "Mon–Sat · 10:00–19:00",
    featured: true,
    accent: accents[2],
    products: ["School Bags", "Laptop Backpacks", "Travel Trolley Bags", "Jute & Canvas Bags"],
    services: ["Bulk Manufacturing", "Custom Branding & Printing", "Institutional Supply"],
    certifications: ["MSME Udyam Registered", "RIFAH Verified Business"],
  },
  {
    id: "smart-india-enterprises",
    name: "Smart India Enterprises",
    tagline: "General trading, electricals and hardware supply",
    about:
      "Smart India Enterprises, led by Mohsin sir, is a trading and supply house serving contractors, builders and industrial buyers with electrical fittings, hardware, safety items and general consumables — including rate contracts and site delivery.",
    industry: "Wholesale & Distribution",
    categories: ["Electricals", "Hardware & Tools", "Industrial Supplies"],
    businessType: "Proprietorship",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Shop 21, Trade Centre Road, Byculla",
    chapter: "Mumbai Chapter",
    membership: "Basic",
    verification: "verified",
    rating: 4.4,
    reviews: 27,
    employees: "10–50",
    founded: "2015",
    website: "example.com/smart-india-enterprises",
    phone: "+91 90000 00002",
    email: "info@smartindia.example",
    hours: "Mon–Sat · 09:30–19:30",
    featured: true,
    accent: accents[0],
    products: ["Electrical Fittings", "Wires & Cables", "Hand Tools", "Safety Equipment"],
    services: ["Bulk Supply", "Rate Contracts", "Site Delivery"],
    certifications: ["GST Registered", "RIFAH Verified Business"],
  },
  {
    id: "lucky-masale",
    name: "Lucky Masale",
    tagline: "Ground spices and blended masala manufacturer",
    about:
      "Lucky Masale, led by Sahil sir, produces ground spices and blended masalas for retail packs, HoReCa kitchens and private-label buyers. Hygienic grinding, batch testing and flexible pack sizes from 50g pouches to 25kg bulk.",
    industry: "Food Processing",
    categories: ["Spices & Masala", "FMCG", "Private Label"],
    businessType: "Partnership",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Plot 9, Food Park Road, Bhiwandi",
    chapter: "Mumbai Chapter",
    membership: "Premium",
    verification: "pending",
    rating: 4.5,
    reviews: 19,
    employees: "10–50",
    founded: "2009",
    website: "example.com/lucky-masale",
    phone: "+91 90000 00003",
    email: "orders@luckymasale.example",
    hours: "Mon–Sat · 09:00–18:00",
    featured: true,
    accent: accents[3],
    products: ["Turmeric Powder", "Red Chilli Powder", "Garam Masala", "Biryani Masala", "Bulk 25kg Packs"],
    services: ["Private Label Packing", "HoReCa Supply", "Custom Blends"],
    certifications: ["FSSAI Licensed", "RIFAH Verified Business"],
  },
  {
    id: "abc-manufacturing",
    name: "Student Alliance",
    tagline: "Precision components for industrial assembly lines",
    about:
      "Student Alliance, led by Awab Fakih, is a precision engineering unit producing machined components, assemblies and tooling for industrial customers. Content shown here is prototype data for review.",
    industry: "Manufacturing",
    categories: ["Precision Engineering", "Industrial Components"],
    businessType: "Private Limited",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Plot 14, Demo Industrial Estate",
    chapter: "Mumbai Chapter",
    membership: "Premium",
    verification: "verified",
    rating: 4.6,
    reviews: 38,
    employees: "120–250",
    founded: "2004",
    website: "example.com/student-alliance",
    phone: "+00 00000 00000",
    email: "awab.fakih@example.com",
    hours: "Mon–Sat · 09:00–18:00",
    featured: true,
    accent: accents[0],
    products: ["CNC Machined Parts", "Sheet Metal Assemblies", "Custom Tooling"],
    services: ["Contract Manufacturing", "Prototyping", "Quality Inspection"],
    certifications: ["ISO 9001 (placeholder)", "RIFAH Verified Business"],
  },
  {
    id: "sunrise-exports",
    name: "Sunrise Exports",
    tagline: "Agro commodity sourcing and export documentation",
    about:
      "Sunrise Exports is a demo listing representing an export house handling agro commodities, packaging and shipment documentation for overseas buyers.",
    industry: "Trading & Export",
    categories: ["Agro Commodities", "Export Services"],
    businessType: "Partnership",
    city: "Ahmedabad",
    state: "Gujarat",
    address: "Unit 8, Demo Trade Centre",
    chapter: "Gujarat Chapter",
    membership: "Premium",
    verification: "verified",
    rating: 4.4,
    reviews: 22,
    employees: "50–120",
    founded: "2011",
    website: "example.com/sunrise-exports",
    phone: "+00 00000 00000",
    email: "trade@example.com",
    hours: "Mon–Fri · 10:00–19:00",
    featured: true,
    accent: accents[1],
    products: ["Spices", "Pulses", "Packaged Grains"],
    services: ["Export Documentation", "Freight Coordination", "Quality Grading"],
    certifications: ["Export House (placeholder)"],
  },
  {
    id: "apex-technologies",
    name: "Apex Technologies",
    tagline: "Enterprise software and industrial automation",
    about:
      "Apex Technologies is a demo listing representing a technology firm delivering ERP rollouts, automation dashboards and integration services to manufacturing clients.",
    industry: "Information Technology",
    categories: ["Software Development", "Automation"],
    businessType: "Private Limited",
    city: "Bengaluru",
    state: "Karnataka",
    address: "Level 4, Demo Tech Park",
    chapter: "Bengaluru Chapter",
    membership: "Enterprise",
    verification: "verified",
    rating: 4.8,
    reviews: 54,
    employees: "250–500",
    founded: "2015",
    website: "example.com/apex-technologies",
    phone: "+00 00000 00000",
    email: "hello@example.com",
    hours: "Mon–Fri · 09:30–18:30",
    featured: true,
    accent: accents[2],
    products: ["Plant Monitoring Suite", "Inventory Console"],
    services: ["ERP Implementation", "Systems Integration", "Managed Support"],
    certifications: ["ISO 27001 (placeholder)"],
  },
  {
    id: "global-traders",
    name: "Global Traders",
    tagline: "Bulk industrial supplies and distribution",
    about:
      "Global Traders is a demo listing representing a distribution business supplying industrial consumables, safety equipment and packaging materials.",
    industry: "Wholesale & Distribution",
    categories: ["Industrial Supplies", "Safety Equipment"],
    businessType: "Proprietorship",
    city: "Delhi",
    state: "Delhi",
    address: "Shop 22, Demo Market Complex",
    chapter: "Delhi Chapter",
    membership: "Basic",
    verification: "pending",
    rating: 4.1,
    reviews: 12,
    employees: "20–50",
    founded: "2009",
    website: "example.com/global-traders",
    phone: "+00 00000 00000",
    email: "sales@example.com",
    hours: "Mon–Sat · 10:00–20:00",
    featured: false,
    accent: accents[3],
    products: ["Safety Gear", "Packaging Rolls", "Fasteners"],
    services: ["Bulk Supply", "Warehousing"],
    certifications: [],
  },
  {
    id: "meridian-logistics",
    name: "Meridian Logistics",
    tagline: "Multi-modal freight and warehousing",
    about:
      "Meridian Logistics is a demo listing representing a logistics operator offering road freight, warehousing and last-mile distribution.",
    industry: "Logistics",
    categories: ["Freight", "Warehousing"],
    businessType: "Private Limited",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "Gate 3, Demo Logistics Park",
    chapter: "Chennai Chapter",
    membership: "Premium",
    verification: "verified",
    rating: 4.3,
    reviews: 29,
    employees: "120–250",
    founded: "2008",
    website: "example.com/meridian-logistics",
    phone: "+00 00000 00000",
    email: "ops@example.com",
    hours: "Open 24 hours",
    featured: true,
    accent: accents[1],
    products: ["Pallet Storage Slots"],
    services: ["Road Freight", "Cold Chain", "Last-mile Delivery"],
    certifications: ["ISO 9001 (placeholder)"],
  },
  {
    id: "northline-textiles",
    name: "Northline Textiles",
    tagline: "Woven fabrics and garment manufacturing",
    about:
      "Northline Textiles is a demo listing representing a textile mill producing woven fabrics and finished garments for domestic and export buyers.",
    industry: "Textiles",
    categories: ["Fabrics", "Garments"],
    businessType: "Private Limited",
    city: "Surat",
    state: "Gujarat",
    address: "Block C, Demo Textile Zone",
    chapter: "Gujarat Chapter",
    membership: "Basic",
    verification: "verified",
    rating: 4.0,
    reviews: 17,
    employees: "250–500",
    founded: "1998",
    website: "example.com/northline-textiles",
    phone: "+00 00000 00000",
    email: "mill@example.com",
    hours: "Mon–Sat · 08:00–17:00",
    featured: false,
    accent: accents[0],
    products: ["Cotton Fabric", "Blended Yarn", "Uniform Sets"],
    services: ["Job Work Dyeing", "Private Label Manufacturing"],
    certifications: [],
  },
  {
    id: "orbit-packaging",
    name: "Orbit Packaging",
    tagline: "Corrugated and flexible packaging solutions",
    about:
      "Orbit Packaging is a demo listing representing a packaging converter producing corrugated boxes, cartons and flexible laminates.",
    industry: "Packaging",
    categories: ["Corrugated Packaging", "Printing"],
    businessType: "Private Limited",
    city: "Pune",
    state: "Maharashtra",
    address: "Shed 7, Demo MIDC Area",
    chapter: "Pune Chapter",
    membership: "Free",
    verification: "correction",
    rating: 3.9,
    reviews: 8,
    employees: "50–120",
    founded: "2016",
    website: "example.com/orbit-packaging",
    phone: "+00 00000 00000",
    email: "info@example.com",
    hours: "Mon–Sat · 09:00–18:00",
    featured: false,
    accent: accents[3],
    products: ["Corrugated Boxes", "Printed Cartons", "Laminate Rolls"],
    services: ["Structural Design", "Bulk Printing"],
    certifications: [],
  },
  {
    id: "harbour-foods",
    name: "Harbour Foods",
    tagline: "Food processing and private-label production",
    about:
      "Harbour Foods is a demo listing representing a food processing unit handling private-label production, packaging and cold storage.",
    industry: "Food Processing",
    categories: ["Food & Beverage", "Private Label"],
    businessType: "Private Limited",
    city: "Kochi",
    state: "Kerala",
    address: "Unit 2, Demo Food Park",
    chapter: "Kerala Chapter",
    membership: "Basic",
    verification: "verified",
    rating: 4.2,
    reviews: 19,
    employees: "50–120",
    founded: "2013",
    website: "example.com/harbour-foods",
    phone: "+00 00000 00000",
    email: "orders@example.com",
    hours: "Mon–Sat · 08:30–18:00",
    featured: false,
    accent: accents[2],
    products: ["Ready-to-cook Range", "Packaged Sauces"],
    services: ["Contract Packing", "Cold Storage"],
    certifications: ["FSSAI (placeholder)"],
  },
  {
    id: "stellar-infra",
    name: "Stellar Infra Projects",
    tagline: "Industrial civil works and plant construction",
    about:
      "Stellar Infra Projects is a demo listing representing a civil contractor executing industrial sheds, plant buildings and site infrastructure.",
    industry: "Construction",
    categories: ["Civil Works", "Project Management"],
    businessType: "Private Limited",
    city: "Hyderabad",
    state: "Telangana",
    address: "Site Office, Demo Industrial Corridor",
    chapter: "Hyderabad Chapter",
    membership: "Premium",
    verification: "verified",
    rating: 4.5,
    reviews: 26,
    employees: "250–500",
    founded: "2006",
    website: "example.com/stellar-infra",
    phone: "+00 00000 00000",
    email: "projects@example.com",
    hours: "Mon–Sat · 09:00–18:00",
    featured: true,
    accent: accents[1],
    products: [],
    services: ["Industrial Sheds", "Plant Civil Works", "Site Supervision"],
    certifications: ["ISO 45001 (placeholder)"],
  },
  {
    id: "vertex-chemicals",
    name: "Vertex Chemicals",
    tagline: "Speciality chemicals and industrial solvents",
    about:
      "Vertex Chemicals is a demo listing representing a speciality chemicals manufacturer supplying solvents, additives and cleaning formulations.",
    industry: "Chemicals",
    categories: ["Speciality Chemicals", "Industrial Solvents"],
    businessType: "Private Limited",
    city: "Vadodara",
    state: "Gujarat",
    address: "Plot 41, Demo Chemical Zone",
    chapter: "Gujarat Chapter",
    membership: "Basic",
    verification: "pending",
    rating: 4.0,
    reviews: 11,
    employees: "120–250",
    founded: "2010",
    website: "example.com/vertex-chemicals",
    phone: "+00 00000 00000",
    email: "enquiry@example.com",
    hours: "Mon–Fri · 09:00–17:30",
    featured: false,
    accent: accents[0],
    products: ["Industrial Solvents", "Surface Cleaners"],
    services: ["Custom Blending", "Technical Advisory"],
    certifications: [],
  },
  {
    id: "bluepeak-consulting",
    name: "BluePeak Consulting",
    tagline: "Compliance, audit and business advisory",
    about:
      "BluePeak Consulting is a demo listing representing an advisory firm offering compliance reviews, audit support and business process consulting.",
    industry: "Professional Services",
    categories: ["Advisory", "Compliance"],
    businessType: "LLP",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Suite 11, Demo Business Centre",
    chapter: "Mumbai Chapter",
    membership: "Free",
    verification: "verified",
    rating: 4.7,
    reviews: 31,
    employees: "20–50",
    founded: "2017",
    website: "example.com/bluepeak",
    phone: "+00 00000 00000",
    email: "advisory@example.com",
    hours: "Mon–Fri · 10:00–19:00",
    featured: false,
    accent: accents[2],
    products: [],
    services: ["Compliance Audit", "Process Consulting", "Training"],
    certifications: [],
  },
  {
    id: "ironwood-tools",
    name: "Ironwood Tools",
    tagline: "Hand tools and workshop equipment",
    about:
      "Ironwood Tools is a demo listing representing a manufacturer and distributor of hand tools, workshop equipment and consumables.",
    industry: "Manufacturing",
    categories: ["Tools & Hardware"],
    businessType: "Proprietorship",
    city: "Ludhiana",
    state: "Punjab",
    address: "Workshop 5, Demo Tool Market",
    chapter: "Punjab Chapter",
    membership: "Free",
    verification: "rejected",
    rating: 3.8,
    reviews: 6,
    employees: "10–20",
    founded: "2019",
    website: "example.com/ironwood",
    phone: "+00 00000 00000",
    email: "shop@example.com",
    hours: "Mon–Sat · 09:00–19:00",
    featured: false,
    accent: accents[3],
    products: ["Hand Tools", "Workbenches", "Abrasives"],
    services: ["Tool Servicing"],
    certifications: [],
  },
];

export const industries = [
  "Manufacturing",
  "Trading & Export",
  "Information Technology",
  "Logistics",
  "Textiles",
  "Packaging",
  "Food Processing",
  "Construction",
  "Chemicals",
  "Professional Services",
  "Wholesale & Distribution",
];

export const cities = [
  "Mumbai",
  "Ahmedabad",
  "Bengaluru",
  "Delhi",
  "Chennai",
  "Surat",
  "Pune",
  "Kochi",
  "Hyderabad",
  "Vadodara",
  "Ludhiana",
];

export const chapters = [
  { id: "mumbai", name: "Mumbai Chapter", city: "Mumbai", state: "Maharashtra", businesses: 148, members: 96, events: 6, status: "Active", lead: "Chapter Secretary (placeholder)" },
  { id: "gujarat", name: "Gujarat Chapter", city: "Ahmedabad", state: "Gujarat", businesses: 132, members: 84, events: 4, status: "Active", lead: "Chapter Secretary (placeholder)" },
  { id: "bengaluru", name: "Bengaluru Chapter", city: "Bengaluru", state: "Karnataka", businesses: 118, members: 77, events: 5, status: "Active", lead: "Chapter Secretary (placeholder)" },
  { id: "delhi", name: "Delhi Chapter", city: "Delhi", state: "Delhi", businesses: 104, members: 61, events: 3, status: "Active", lead: "Chapter Secretary (placeholder)" },
  { id: "chennai", name: "Chennai Chapter", city: "Chennai", state: "Tamil Nadu", businesses: 87, members: 52, events: 2, status: "Forming", lead: "Chapter Secretary (placeholder)" },
];

export const units = [
  { id: "u-trade", name: "Trade Facilitation Unit", chapter: "Mumbai Chapter", focus: "Export documentation support", members: 34, status: "Active" },
  { id: "u-msme", name: "MSME Support Unit", chapter: "Gujarat Chapter", focus: "Small business advisory", members: 41, status: "Active" },
  { id: "u-tech", name: "Digital Adoption Unit", chapter: "Bengaluru Chapter", focus: "Technology enablement", members: 28, status: "Active" },
  { id: "u-women", name: "Women in Business Unit", chapter: "Delhi Chapter", focus: "Network and mentoring", members: 22, status: "Planned" },
];












export const catalogue = [
  { id: "p1", name: "CNC Machined Components", type: "Product", businessId: "abc-manufacturing", category: "Precision Engineering", description: "Custom machined parts produced to supplied drawings and tolerances.", city: "Mumbai", moq: "500 units" },
  { id: "p2", name: "Contract Manufacturing", type: "Service", businessId: "abc-manufacturing", category: "Manufacturing Services", description: "End-to-end production capacity for assemblies and sub-assemblies.", city: "Mumbai" },
  { id: "p3", name: "Packaged Spices (Bulk)", type: "Product", businessId: "sunrise-exports", category: "Agro Commodities", description: "Graded and packed spice lots prepared for export shipments.", city: "Ahmedabad", moq: "2 MT" },
  { id: "p4", name: "Export Documentation", type: "Service", businessId: "sunrise-exports", category: "Export Services", description: "Preparation and filing of shipment and compliance paperwork.", city: "Ahmedabad" },
  { id: "p5", name: "Plant Monitoring Suite", type: "Product", businessId: "apex-technologies", category: "Software", description: "Dashboarding for machine uptime, output and maintenance windows.", city: "Bengaluru" },
  { id: "p6", name: "ERP Implementation", type: "Service", businessId: "apex-technologies", category: "IT Services", description: "Discovery, configuration and rollout support for manufacturing ERP.", city: "Bengaluru" },
  { id: "p7", name: "Corrugated Boxes", type: "Product", businessId: "orbit-packaging", category: "Packaging", description: "3-ply and 5-ply boxes in standard and custom dimensions.", city: "Pune", moq: "1,000 pcs" },
  { id: "p8", name: "Cold Chain Transport", type: "Service", businessId: "meridian-logistics", category: "Logistics", description: "Temperature-controlled movement with route-level tracking.", city: "Chennai" },
  { id: "p9", name: "Industrial Solvents", type: "Product", businessId: "vertex-chemicals", category: "Chemicals", description: "Bulk solvent supply with technical data sheets on request.", city: "Vadodara", moq: "200 L" },
  { id: "p10", name: "Compliance Audit", type: "Service", businessId: "bluepeak-consulting", category: "Advisory", description: "Structured review of statutory and internal compliance controls.", city: "Mumbai" },
];



















export const events = [
  {
    id: "ev-trade-meet",
    title: "RIFAH Trade Connect Meet",
    date: "18 Sep 2026",
    time: "10:00 – 16:00",
    venue: "Demo Convention Hall",
    city: "Mumbai",
    mode: "In-person",
    chapter: "Mumbai Chapter",
    organizer: "RIFAH Mumbai Chapter",
    fee: "Placeholder fee",
    seats: "Limited seats",
    status: "Upcoming",
    registered: true,
    summary:
      "A structured networking format where member businesses present capability briefs and meet potential buyers across sectors.",
    agenda: [
      { time: "10:00", item: "Registration and welcome" },
      { time: "10:45", item: "Chapter briefing" },
      { time: "11:30", item: "Capability presentations" },
      { time: "14:00", item: "Structured B2B meetings" },
      { time: "15:30", item: "Closing and follow-ups" },
    ],
  },
  {
    id: "ev-export-clinic",
    title: "Export Readiness Clinic",
    date: "02 Oct 2026",
    time: "11:00 – 13:30",
    venue: "Online session",
    city: "Online",
    mode: "Online",
    chapter: "Gujarat Chapter",
    organizer: "RIFAH Trade Facilitation Unit",
    fee: "No fee",
    seats: "Open registration",
    status: "Upcoming",
    registered: false,
    summary:
      "Working session covering documentation, buyer discovery and common compliance gaps for first-time exporters.",
    agenda: [
      { time: "11:00", item: "Export documentation walkthrough" },
      { time: "12:00", item: "Buyer discovery channels" },
      { time: "13:00", item: "Open questions" },
    ],
  },
  {
    id: "ev-msme-forum",
    title: "MSME Growth Forum",
    date: "21 Oct 2026",
    time: "09:30 – 17:00",
    venue: "Demo Business Centre",
    city: "Ahmedabad",
    mode: "Hybrid",
    chapter: "Gujarat Chapter",
    organizer: "RIFAH MSME Support Unit",
    fee: "Placeholder fee",
    seats: "Limited seats",
    status: "Upcoming",
    registered: false,
    summary:
      "Sessions on financing, digital adoption and supply chain participation for small and medium enterprises.",
    agenda: [
      { time: "09:30", item: "Opening address" },
      { time: "10:30", item: "Financing pathways" },
      { time: "13:00", item: "Digital adoption clinic" },
      { time: "15:30", item: "Chapter networking" },
    ],
  },
  {
    id: "ev-industry-tour",
    title: "Industrial Facility Visit",
    date: "09 Nov 2026",
    time: "14:00 – 17:00",
    venue: "Demo Manufacturing Campus",
    city: "Pune",
    mode: "In-person",
    chapter: "Pune Chapter",
    organizer: "RIFAH Pune Chapter",
    fee: "Placeholder fee",
    seats: "40 participants",
    status: "Upcoming",
    registered: false,
    summary: "Guided visit to a member facility with a walkthrough of production planning and quality systems.",
    agenda: [
      { time: "14:00", item: "Safety briefing" },
      { time: "14:30", item: "Shop floor walkthrough" },
      { time: "16:00", item: "Q&A with plant team" },
    ],
  },
  {
    id: "ev-annual-summit",
    title: "RIFAH Annual Business Summit",
    date: "12 Jul 2026",
    time: "09:00 – 18:00",
    venue: "Demo Grand Hall",
    city: "Delhi",
    mode: "In-person",
    chapter: "Delhi Chapter",
    organizer: "RIFAH Secretariat",
    fee: "Placeholder fee",
    seats: "Closed",
    status: "Past",
    registered: true,
    summary: "The chamber's annual gathering with sector panels, chapter reports and member recognitions.",
    agenda: [{ time: "09:00", item: "Registration" }, { time: "10:00", item: "Sector panels" }],
  },
];




















export const enquiries = [
  {
    id: "ENQ-2041",
    title: "Machined brackets for assembly line",
    requester: "Rehan Qureshi",
    requesterRole: "Procurement, demo buyer account",
    businessId: "abc-manufacturing",
    category: "Precision Engineering",
    quantity: "5,000 units",
    budget: "Placeholder budget",
    location: "Mumbai, Maharashtra",
    requiredBy: "30 Sep 2026",
    createdAt: "2 hours ago",
    status: "New",
    priority: "High",
    responses: 0,
    description:
      "Requirement for machined mounting brackets to drawing. Need supplier capable of first-article inspection and monthly repeat batches.",
    timeline: [
      { label: "Enquiry submitted", at: "2 hours ago", done: true },
      { label: "Routed to matching businesses", at: "2 hours ago", done: true },
      { label: "Awaiting business response", at: "Pending", done: false },
      { label: "Enquiry closed", at: "Pending", done: false },
    ],
  },
  {
    id: "ENQ-2038",
    title: "Bulk corrugated packaging supply",
    requester: "Nadia Sheikh",
    requesterRole: "Operations, demo buyer account",
    businessId: "orbit-packaging",
    category: "Packaging",
    quantity: "20,000 boxes / month",
    budget: "Placeholder budget",
    location: "Pune, Maharashtra",
    requiredBy: "15 Oct 2026",
    createdAt: "Yesterday",
    status: "In Progress",
    priority: "Medium",
    responses: 2,
    description: "Monthly requirement for printed 5-ply boxes in three sizes. Samples required before order confirmation.",
    timeline: [
      { label: "Enquiry submitted", at: "Yesterday", done: true },
      { label: "Routed to 4 businesses", at: "Yesterday", done: true },
      { label: "2 responses received", at: "Today", done: true },
      { label: "Enquiry closed", at: "Pending", done: false },
    ],
  },
  {
    id: "ENQ-2033",
    title: "ERP rollout for two plants",
    requester: "Imran Farooqui",
    requesterRole: "IT Head, demo buyer account",
    businessId: "apex-technologies",
    category: "IT Services",
    quantity: "2 sites",
    budget: "Placeholder budget",
    location: "Bengaluru, Karnataka",
    requiredBy: "01 Dec 2026",
    createdAt: "3 days ago",
    status: "Responded",
    priority: "High",
    responses: 3,
    description: "Looking for an implementation partner for a phased ERP rollout across two manufacturing sites.",
    timeline: [
      { label: "Enquiry submitted", at: "3 days ago", done: true },
      { label: "Routed to 6 businesses", at: "3 days ago", done: true },
      { label: "3 responses received", at: "2 days ago", done: true },
      { label: "Enquiry closed", at: "Pending", done: false },
    ],
  },
  {
    id: "ENQ-2027",
    title: "Cold chain transport partner",
    requester: "Sara Ali",
    requesterRole: "Supply Chain, demo buyer account",
    businessId: "meridian-logistics",
    category: "Logistics",
    quantity: "12 trips / month",
    budget: "Placeholder budget",
    location: "Chennai, Tamil Nadu",
    requiredBy: "20 Sep 2026",
    createdAt: "5 days ago",
    status: "Won",
    priority: "Medium",
    responses: 4,
    description: "Regular temperature-controlled movement between plant and distribution hub.",
    timeline: [
      { label: "Enquiry submitted", at: "5 days ago", done: true },
      { label: "Responses received", at: "4 days ago", done: true },
      { label: "Business selected", at: "2 days ago", done: true },
      { label: "Enquiry closed", at: "Yesterday", done: true },
    ],
  },
  {
    id: "ENQ-2019",
    title: "Compliance audit for FY review",
    requester: "Tariq Mahmood",
    requesterRole: "Finance, demo buyer account",
    businessId: "bluepeak-consulting",
    category: "Advisory",
    quantity: "1 engagement",
    budget: "Placeholder budget",
    location: "Mumbai, Maharashtra",
    requiredBy: "10 Nov 2026",
    createdAt: "1 week ago",
    status: "Closed",
    priority: "Low",
    responses: 2,
    description: "Independent compliance review ahead of the annual audit cycle.",
    timeline: [
      { label: "Enquiry submitted", at: "1 week ago", done: true },
      { label: "Responses received", at: "6 days ago", done: true },
      { label: "Enquiry closed", at: "3 days ago", done: true },
    ],
  },
  {
    id: "ENQ-2012",
    title: "Uniform fabric supply",
    requester: "Ayesha Khan",
    requesterRole: "Admin, demo buyer account",
    businessId: "northline-textiles",
    category: "Textiles",
    quantity: "8,000 metres",
    budget: "Placeholder budget",
    location: "Surat, Gujarat",
    requiredBy: "05 Oct 2026",
    createdAt: "1 week ago",
    status: "Rejected",
    priority: "Low",
    responses: 1,
    description: "Bulk fabric requirement for staff uniforms across three locations.",
    timeline: [
      { label: "Enquiry submitted", at: "1 week ago", done: true },
      { label: "Business declined", at: "5 days ago", done: true },
    ],
  },
];












export const conversations = [
  {
    id: "c1",
    name: "Rehan Qureshi",
    org: "Demo buyer account",
    last: "Can you share the first-article inspection process?",
    time: "09:42",
    unread: 2,
    online: true,
    messages: [
      { from: "them", text: "Hello, we reviewed your profile against enquiry ENQ-2041.", time: "09:31" },
      { from: "me", text: "Thank you. We can produce to your drawing with monthly repeat batches.", time: "09:35" },
      { from: "them", text: "Can you share the first-article inspection process?", time: "09:42" },
    ],
  },
  {
    id: "c2",
    name: "Nadia Sheikh",
    org: "Demo buyer account",
    last: "Samples received, reviewing internally.",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      { from: "them", text: "Samples received, reviewing internally.", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    name: "Apex Technologies",
    org: "Enterprise member",
    last: "Sharing the phased rollout outline shortly.",
    time: "Yesterday",
    unread: 1,
    online: true,
    messages: [
      { from: "me", text: "Could you outline the rollout phases?", time: "16:02" },
      { from: "them", text: "Sharing the phased rollout outline shortly.", time: "16:20" },
    ],
  },
  {
    id: "c4",
    name: "Meridian Logistics",
    org: "Premium member",
    last: "Confirmed the trip schedule for next month.",
    time: "Mon",
    unread: 0,
    online: false,
    messages: [{ from: "them", text: "Confirmed the trip schedule for next month.", time: "Mon" }],
  },
  {
    id: "c5",
    name: "RIFAH Secretariat",
    org: "Chamber support",
    last: "Your verification documents are under review.",
    time: "Sun",
    unread: 0,
    online: false,
    messages: [{ from: "them", text: "Your verification documents are under review.", time: "Sun" }],
  },
  {
    id: "c6",
    name: "Sunrise Exports",
    org: "Premium member",
    last: "We can quote once quantities are confirmed.",
    time: "Sat",
    unread: 0,
    online: false,
    messages: [{ from: "them", text: "We can quote once quantities are confirmed.", time: "Sat" }],
  },
];










export const notifications = [
  { id: "n1", type: "Lead", title: "New lead assigned", body: "ENQ-2041 · Machined brackets for assembly line matched your category.", time: "2 hours ago", unread: true },
  { id: "n2", type: "Message", title: "New message from Rehan Qureshi", body: "Can you share the first-article inspection process?", time: "3 hours ago", unread: true },
  { id: "n3", type: "Membership", title: "Membership renewal due", body: "Your Premium membership expires on 14 Nov 2026.", time: "Yesterday", unread: true },
  { id: "n4", type: "Payment", title: "Payment received", body: "Invoice INV-4820 has been marked as paid.", time: "Yesterday", unread: false },
  { id: "n5", type: "Event", title: "Event reminder", body: "RIFAH Trade Connect Meet begins in 3 days.", time: "2 days ago", unread: false },
  { id: "n6", type: "Review", title: "New review received", body: "A buyer left a 5-star review on your business profile.", time: "4 days ago", unread: false },
  { id: "n7", type: "Account", title: "Verification update", body: "Your business verification is under review by RIFAH.", time: "6 days ago", unread: false },
];

export const membershipPlans = [
  {
    id: "free",
    name: "Free Listing",
    price: "No fee",
    period: "",
    summary: "Basic presence in the RIFAH business directory.",
    visibility: "Standard directory listing",
    products: "Up to 3 products or services",
    leads: "Limited lead visibility",
    highlight: false,
    features: ["Public business profile", "Basic contact details", "Directory search visibility", "Community access"],
  },
  {
    id: "basic",
    name: "Basic",
    price: "Placeholder",
    period: "per year",
    summary: "For small businesses starting to build enquiry flow.",
    visibility: "Improved directory ranking",
    products: "Up to 15 products or services",
    leads: "Standard lead routing",
    highlight: false,
    features: ["Everything in Free", "Verified badge eligibility", "Enquiry inbox", "Basic profile analytics", "Chapter participation"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "Placeholder",
    period: "per year",
    summary: "For growing businesses that depend on lead generation.",
    visibility: "Featured placement in search",
    products: "Unlimited products and services",
    leads: "Priority lead routing",
    highlight: true,
    features: ["Everything in Basic", "Featured business card", "Priority lead access", "Gallery and certifications", "Full analytics dashboard", "Event visibility"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "On request",
    period: "",
    summary: "For large organisations and multi-unit groups.",
    visibility: "Top-tier placement and branding",
    products: "Unlimited with multiple catalogues",
    leads: "Dedicated lead allocation rules",
    highlight: false,
    features: ["Everything in Premium", "Multiple business units", "Team accounts", "Custom lead rules", "Dedicated chamber liaison", "Reporting exports"],
  },
];

export const reviews = [
  { id: "r1", author: "Rehan Qureshi", role: "Procurement, demo buyer", rating: 5, title: "Responsive and consistent", body: "Clear communication throughout the enquiry and delivery matched the agreed schedule.", date: "12 Aug 2026" },
  { id: "r2", author: "Sara Ali", role: "Supply Chain, demo buyer", rating: 4, title: "Good quality, minor delay", body: "Quality was as specified. One batch arrived two days behind schedule.", date: "28 Jul 2026" },
  { id: "r3", author: "Tariq Mahmood", role: "Finance, demo buyer", rating: 5, title: "Straightforward to work with", body: "Documentation was complete and the team answered follow-up questions quickly.", date: "14 Jul 2026" },
];

export const leadTrend = [
  { month: "Mar", leads: 18, enquiries: 26, views: 420 },
  { month: "Apr", leads: 24, enquiries: 31, views: 505 },
  { month: "May", leads: 21, enquiries: 29, views: 470 },
  { month: "Jun", leads: 33, enquiries: 44, views: 640 },
  { month: "Jul", leads: 38, enquiries: 51, views: 712 },
  { month: "Aug", leads: 46, enquiries: 58, views: 860 },
];

export const adminTrend = [
  { month: "Mar", members: 620, registrations: 42, revenue: 180 },
  { month: "Apr", members: 664, registrations: 51, revenue: 205 },
  { month: "May", members: 702, registrations: 46, revenue: 198 },
  { month: "Jun", members: 758, registrations: 63, revenue: 246 },
  { month: "Jul", members: 811, registrations: 70, revenue: 268 },
  { month: "Aug", members: 872, registrations: 82, revenue: 305 },
];

export const payments = [
  { id: "INV-4820", item: "Premium membership renewal", payer: "Student Alliance", amount: "Placeholder", date: "14 Aug 2026", method: "Card", status: "Paid"  },
  { id: "INV-4811", item: "Event registration · Trade Connect Meet", payer: "Sunrise Exports", amount: "Placeholder", date: "11 Aug 2026", method: "Bank transfer", status: "Paid"  },
  { id: "INV-4802", item: "Basic membership", payer: "Global Traders", amount: "Placeholder", date: "08 Aug 2026", method: "UPI", status: "Pending"  },
  { id: "INV-4795", item: "Premium membership", payer: "Vertex Chemicals", amount: "Placeholder", date: "05 Aug 2026", method: "Card", status: "Failed"  },
  { id: "INV-4788", item: "Event registration · MSME Forum", payer: "Harbour Foods", amount: "Placeholder", date: "02 Aug 2026", method: "Card", status: "Refunded"  },
];

export const auditLogs = [
  { id: "a1", actor: "Admin · Secretariat", action: "Approved business verification", target: "Meridian Logistics", time: "Today 11:24" },
  { id: "a2", actor: "Admin · Membership desk", action: "Updated membership plan benefits", target: "Premium plan", time: "Today 10:02" },
  { id: "a3", actor: "Admin · Chapter Mumbai", action: "Created event", target: "RIFAH Trade Connect Meet", time: "Yesterday 17:40" },
  { id: "a4", actor: "Admin · Moderation", action: "Removed review", target: "Review #R-882", time: "Yesterday 15:12" },
  { id: "a5", actor: "Admin · Secretariat", action: "Requested correction", target: "Orbit Packaging", time: "2 days ago" },
];

export const users = [
  { id: "u1", name: "Rehan Qureshi", email: "rehan@example.com", role: "Customer", chapter: "Mumbai Chapter", status: "Active", joined: "12 Mar 2026" },
  { id: "u2", name: "Ayesha Khan", email: "ayesha@example.com", role: "Business Owner", chapter: "Gujarat Chapter", status: "Active", joined: "04 Feb 2026" },
  { id: "u3", name: "Imran Farooqui", email: "imran@example.com", role: "Business Owner", chapter: "Bengaluru Chapter", status: "Active", joined: "22 Jan 2026" },
  { id: "u4", name: "Nadia Sheikh", email: "nadia@example.com", role: "Customer", chapter: "Pune Chapter", status: "Suspended", joined: "18 Dec 2025" },
  { id: "u5", name: "Tariq Mahmood", email: "tariq@example.com", role: "Chapter Admin", chapter: "Delhi Chapter", status: "Active", joined: "09 Nov 2025" },
];

export const categories = [
  { id: "c1", name: "Precision Engineering", parent: "Manufacturing", businesses: 64, status: "Active" },
  { id: "c2", name: "Agro Commodities", parent: "Trading & Export", businesses: 41, status: "Active" },
  { id: "c3", name: "Software Development", parent: "Information Technology", businesses: 58, status: "Active" },
  { id: "c4", name: "Freight & Warehousing", parent: "Logistics", businesses: 33, status: "Active" },
  { id: "c5", name: "Corrugated Packaging", parent: "Packaging", businesses: 27, status: "Draft" },
];

export function getBusiness(id) {
  return businesses.find((b) => b.id === id);
}

export function getEnquiry(id) {
  return enquiries.find((e) => e.id === id);
}

export function getEvent(id) {
  return events.find((e) => e.id === id);
}

export const savedBusinessIds = ["apex-technologies", "sunrise-exports", "meridian-logistics", "bluepeak-consulting"];
