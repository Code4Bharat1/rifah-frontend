// Shared client-side field validators. Mirrors rifah-backend/src/shared/validators/common.validation.js
// so both layers reject the same input.

export const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]{1,99}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

export const isValidName = (name) => Boolean(name && NAME_PATTERN.test(String(name).trim()));
export const isValidEmail = (email) => Boolean(email && EMAIL_PATTERN.test(String(email).trim()));
export const isValidPincode = (pincode) => Boolean(pincode && PINCODE_PATTERN.test(String(pincode).trim()));
