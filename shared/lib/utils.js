import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number/amount into Indian financial denomination notation (₹... Cr, ₹... Lakh, or ₹...)
 * e.g., 1001284260 -> "₹100.13 Cr"
 *       124306789  -> "₹12.43 Cr"
 *       5500000    -> "₹55 Lakh"
 *       150000     -> "₹1.5 Lakh"
 *       75000      -> "₹75,000"
 */
export function formatIndianCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  const num = Number(amount);
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  // 1 Crore = 1,00,00,000 (10^7)
  if (abs >= 10000000) {
    const cr = abs / 10000000;
    const formatted = cr.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${sign}₹${formatted} Cr`;
  }

  // 1 Lakh = 1,00,000 (10^5)
  if (abs >= 100000) {
    const lakh = abs / 100000;
    const formatted = lakh.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${sign}₹${formatted} Lakh`;
  }

  // Under 1 Lakh: standard Indian comma notation
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
}

/**
 * Formats a number into full Indian currency format (e.g., ₹1,00,12,84,264)
 */
export function formatCurrencyFull(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

