/**
 * Demo imagery for the RIFAH Connect prototype.
 * Photos are illustrative placeholders mapped by member id / industry.
 */
const bags = "/images/biz/bags.jpg";
const chemicals = "/images/biz/chemicals.jpg";
const construction = "/images/biz/construction.jpg";
const eventPhoto = "/images/biz/event.jpg";
const exportTrade = "/images/biz/export.jpg";
const food = "/images/biz/food.jpg";
const ifdpPanels = "/images/biz/ifdp-panels.jpg";
const it = "/images/biz/it.jpg";
const logistics = "/images/biz/logistics.jpg";
const manufacturing = "/images/biz/manufacturing.jpg";
const packaging = "/images/biz/packaging.jpg";
const services = "/images/biz/services.jpg";
const textiles = "/images/biz/textiles.jpg";
const wholesale = "/images/biz/wholesale.jpg";
const byId = {
  "bakka-bags": bags,
  "smart-india-enterprises": wholesale,
  "lucky-masale": food,
  "abc-manufacturing": ifdpPanels,
};

const byIndustry = {
  Manufacturing: manufacturing,
  "Wholesale & Distribution": wholesale,
  "Food Processing": food,
  "Trading & Export": exportTrade,
  "Information Technology": it,
  Logistics: logistics,
  Textiles: textiles,
  Packaging: packaging,
  Construction: construction,
  Chemicals: chemicals,
  "Professional Services": services,
};

export const eventImage = eventPhoto;

export const galleryPool = [
  manufacturing,
  bags,
  wholesale,
  food,
  logistics,
  packaging,
  textiles,
  construction,
  ifdpPanels,
];

/** Cover / thumbnail photo for a member business. */
export function businessImage(business) {
  const bid = business.id || business._id;
  return byId[bid] ?? byIndustry[business.industry] ?? manufacturing;
}

/** Six deterministic gallery photos for a member business. */
export function businessGallery(business) {
  const lead = businessImage(business);
  const rest = galleryPool.filter((src) => src !== lead);
  const bid = business.id || business._id || "123456";
  const offset = bid.length % rest.length;
  const rotated = [...rest.slice(offset), ...rest.slice(0, offset)];
  return [lead, ...rotated].slice(0, 6);
}
