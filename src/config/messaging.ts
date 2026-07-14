/**
 * Positioning guardrails — the single source of truth for how GrowthOS
 * describes itself. GrowthOS is a **Revenue Intelligence Platform**, not an
 * "AI tool". Customers buy revenue, not AI.
 *
 * Copy across marketing, product, emails and PDFs should pull from — or align
 * with — this vocabulary. The `bannedTerms` list documents language we never
 * ship in customer-facing surfaces.
 */
export const positioning = {
  category: "Revenue Intelligence Platform",
  pillars: {
    revenue: "Revenue Intelligence",
    growth: "Growth Intelligence",
    conversion: "Conversion Intelligence",
  },
  promise: "See exactly where your revenue leaks — and how to fix it.",
  /**
   * Language we deliberately avoid in customer-facing copy. We lead with the
   * business outcome (revenue, growth, conversion), never the mechanism (AI).
   */
  bannedTerms: [
    "AI Website Analyzer",
    "AI Marketing Tool",
    "AI tool",
    "chatbot",
    "GPT wrapper",
  ],
} as const;

export type Positioning = typeof positioning;
