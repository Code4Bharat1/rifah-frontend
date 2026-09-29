// Shared client-side field validators. Mirrors rifah-backend/src/shared/validators/common.validation.js
// so web, mobile and API all reject the same input.

export const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]{1,99}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;
export const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

export const isValidName = (name) => Boolean(name && NAME_PATTERN.test(String(name).trim()));
export const isValidEmail = (email) => Boolean(email && EMAIL_PATTERN.test(String(email).trim()));
export const isValidPincode = (pincode) => Boolean(pincode && PINCODE_PATTERN.test(String(pincode).trim()));
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleanPhone = String(phone).replace(/[\s\-()]/g, "");
  return PHONE_PATTERN.test(cleanPhone);
};

// Strips non-digits and caps to 10 digits, for use in a phone/mobile/WhatsApp input's onChange.
export const sanitizePhoneDigits = (value) => String(value ?? "").replace(/\D/g, "").slice(0, 10);

// Strips non-digits and caps to 6 digits, for use in a pincode input's onChange.
export const sanitizePincodeDigits = (value) => String(value ?? "").replace(/\D/g, "").slice(0, 6);

// Strips non-digits and caps to 4 digits, for use in a year input's onChange.
export const sanitizeYearDigits = (value) => String(value ?? "").replace(/\D/g, "").slice(0, 4);

/**
 * Checks if a business is currently pending verification, under review, or unverified.
 */
export const isBusinessPendingVerification = (business) => {
  if (!business) return false;
  const v = String(business.verification || business.verificationStatus || "").toLowerCase().trim();
  const s = String(business.status || "").toLowerCase().trim();
  return (
    v === "pending" ||
    v === "under_review" ||
    v === "unverified" ||
    v === "correction_requested" ||
    s === "pending verification" ||
    s === "pending_verification" ||
    s === "pending" ||
    s === "draft"
  );
};

/**
 * Checks if a business has verified status and is eligible for administrative allocation.
 */
export const isBusinessVerified = (business) => {
  if (!business) return false;
  if (isBusinessPendingVerification(business)) return false;
  const v = String(business.verification || business.verificationStatus || "").toLowerCase().trim();
  return v === "verified" || v === "approved" || business.isVerified === true;
};

