// Shared client-side field validators. Mirrors rifah-backend/src/shared/validators/common.validation.js
// so web, mobile and API all reject the same input.

export const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]{1,99}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;
export const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

export const DISPOSABLE_OR_DUMMY_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "throwaway.com",
  "guerrillamail.com",
  "yopmail.com",
  "dispostable.com",
  "trashmail.com",
  "sharklasers.com",
  "getairmail.com",
  "fake.com",
  "dummy.com",
]);

export const DUMMY_USERNAMES = new Set([
  "test",
  "tester",
  "testing",
  "dummy",
  "fake",
  "sample",
  "asdf",
  "asdfgh",
  "qwerty",
  "temp",
  "random",
  "null",
  "undefined",
  "trtrtr",
  "foobar",
  "noname",
]);

/**
 * Validates whether an email is properly formatted and not an obvious fake, dummy, or disposable address.
 */
export const validateLegitimateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Please enter an email address." };
  }
  const clean = email.trim().toLowerCase();

  // Strict RFC-compliant standard email syntax check
  const standardEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!standardEmailRegex.test(clean) || clean.includes("..")) {
    return { valid: false, message: "Please enter a valid email format (e.g. name@domain.com)." };
  }

  const [localPart, domain] = clean.split("@");
  if (!localPart || !domain) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  if (localPart.length < 2) {
    return { valid: false, message: "Email username is too short." };
  }

  // Check known disposable domains
  if (DISPOSABLE_OR_DUMMY_DOMAINS.has(domain)) {
    return { valid: false, message: "Temporary or disposable email domains are not allowed." };
  }

  // Check known dummy usernames
  if (DUMMY_USERNAMES.has(localPart)) {
    return { valid: false, message: "Dummy or generic test usernames are not allowed. Please enter your real email." };
  }

  // Check repeated single character (e.g. aaaa, 1111)
  if (/^(.)\1{3,}$/.test(localPart)) {
    return { valid: false, message: "Repeated character email addresses are not permitted." };
  }

  // Check repeated 2-4 char syllables (e.g. trtrtr, abcabcabc, lalala)
  if (/^([a-zA-Z0-9]{2,4})\1{2,}$/.test(localPart)) {
    return { valid: false, message: "Repetitive or dummy email usernames are not permitted." };
  }

  // Check absence of vowels or digits in local part if >= 5 characters (e.g. trtrtr, bcdfgh, etc.)
  if (localPart.length >= 5 && !/[aeiouy0-9]/i.test(localPart)) {
    return { valid: false, message: "Please enter a valid, active email address." };
  }

  return { valid: true };
};

export const isValidName = (name) => Boolean(name && NAME_PATTERN.test(String(name).trim()));
export const isValidEmail = (email) => Boolean(email && validateLegitimateEmail(email).valid);
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

