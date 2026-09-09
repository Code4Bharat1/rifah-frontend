const eventPhoto = "/images/biz/event.jpg";
export const eventImage = eventPhoto;

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export function resolveMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("/images/")) {
    return path;
  }
  if (path.startsWith("http://localhost:5000/uploads/")) {
    return path.replace("http://localhost:5000", "");
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath.startsWith("/uploads/")) {
    return cleanPath;
  }
  return `${SERVER_BASE_URL}${cleanPath}`;
}

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
