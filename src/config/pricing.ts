/**
 * Commercial config for the revenue flow.
 * One-time report unlock is the acquisition product; the subscription is the
 * post-purchase upsell (growth loop).
 */

export const REPORT_PRICE_CENTS = 2900; // €29 one-time
export const REPORT_PRICE_LABEL = "€29";
export const REPORT_CURRENCY = "eur";
export const REPORT_PRODUCT_NAME = "GrowthOS Revenue Intelligence Report";

export const SUBSCRIPTION = {
  priceLabel: "€149",
  interval: "month",
  name: "GrowthOS Growth",
  blurb: "Unlimited Revenue Reports for all your stores and clients.",
} as const;
