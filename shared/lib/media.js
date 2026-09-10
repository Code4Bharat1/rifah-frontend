import { resolveMediaUrl } from "./api-client";

export { resolveMediaUrl };

const eventPhoto = "/images/biz/event.jpg";
export const eventImage = eventPhoto;

/** Cover / thumbnail photo for a member business. */
export function businessImage(business) {
  if (!business) return "";
  if (business.coverImage) return resolveMediaUrl(business.coverImage);
  if (business.logo) return resolveMediaUrl(business.logo);
  return "";
}

/** Logo photo for a member business. */
export function businessLogo(business) {
  if (!business) return "";
  if (business.logo) return resolveMediaUrl(business.logo);
  return "";
}

/** Gallery photos for a member business. */
export function businessGallery(business) {
  if (!business) return [];
  if (Array.isArray(business.gallery) && business.gallery.length > 0) {
    return business.gallery.map(resolveMediaUrl).filter(Boolean);
  }
  return [];
}

