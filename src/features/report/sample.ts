import type { RevenueReport } from "./types";

/**
 * SAMPLE report — for design review of the report page and PDF only.
 * Never shown to a customer as their own results. Real reports come from the
 * live crawl + AI pipeline.
 */
export const sampleReport: RevenueReport = {
  url: "https://lumiere-jewelry.com",
  brandName: "Lumière Jewelry",
  overallScore: 63,
  executiveSummary:
    "Lumière converts well below its potential for a brand with this much visual polish. The homepage buries its value proposition, product pages lack the trust signals shoppers need before spending €100+, and there is no email capture on exit. Closing the three critical gaps below is worth an estimated €4,100–€7,600 in additional monthly revenue.",
  totalMonthlyLowCents: 6_900_00,
  totalMonthlyHighCents: 12_400_00,
  scores: [
    { category: "conversion", score: 58 },
    { category: "trust", score: 49 },
    { category: "copywriting", score: 61 },
    { category: "seo", score: 72 },
    { category: "mobile", score: 55 },
    { category: "speed", score: 68 },
    { category: "email", score: 34 },
  ],
  criticalIssues: [
    {
      id: "issue-1",
      title: "The homepage hero doesn't say what you sell or why to buy",
      category: "copywriting",
      severity: "critical",
      currentSituation:
        "The hero shows a lifestyle image with the single word “Lumière” and a “Shop” button — no value proposition, no offer, no reason to stay.",
      problem:
        "First-time visitors from ads can't tell what makes the product worth its price within the first 5 seconds, so they bounce before scrolling.",
      whyItHurts:
        "Roughly 60% of paid traffic lands on the homepage. A weak hero taxes every downstream metric — add-to-cart, checkout and ROAS all suffer.",
    },
    {
      id: "issue-2",
      title: "Product pages have no trust signals above the fold",
      category: "trust",
      severity: "critical",
      currentSituation:
        "Product pages show price and an add-to-cart button, but no reviews, guarantees, materials, or shipping/returns information near the buy box.",
      problem:
        "Shoppers spending €100+ on jewelry need reassurance the piece is high quality and returnable before they commit.",
      whyItHurts:
        "Missing trust cues is the single biggest driver of cart abandonment in premium ecommerce — you're losing ready-to-buy shoppers at the last step.",
    },
    {
      id: "issue-3",
      title: "No email capture — you're paying for traffic you never see again",
      category: "email",
      severity: "high",
      currentSituation:
        "There is no newsletter signup, exit-intent offer, or post-purchase capture anywhere on the site.",
      problem:
        "95%+ of first-time visitors don't buy, and without email capture there is no way to bring them back for free.",
      whyItHurts:
        "Email typically drives 25–30% of ecommerce revenue. With zero capture, that entire channel is currently worth €0.",
    },
  ],
  quickWins: [
    {
      id: "opp-1",
      title: "Rewrite the hero with a clear value proposition + offer",
      category: "copywriting",
      whatToDo:
        "Replace the one-word hero with a benefit-led headline, a one-line subhead on materials/warranty, and a specific primary CTA.",
      example:
        "Waterproof 18k gold jewelry that never fades — or your money back. Free shipping over €50.",
      difficulty: "easy",
      estimatedMinutes: 45,
      confidence: 88,
      priority: 1,
      whyItMatters:
        "Your hero is the first thing ~60% of paid visitors see. A clear promise here lifts add-to-cart, checkout and ROAS all at once — nothing else has this much leverage.",
      monthlyLowCents: 1_800_00,
      monthlyHighCents: 3_200_00,
      action: "generate",
    },
    {
      id: "opp-2",
      title: "Add reviews and a guarantee badge to the product buy box",
      category: "trust",
      whatToDo:
        "Surface star rating + review count directly under the product title, and a “30-day returns · never fades” badge beside the add-to-cart button.",
      example:
        "★ 4.8 (2,140 reviews) · 30-day free returns · Waterproof guarantee",
      difficulty: "easy",
      estimatedMinutes: 90,
      confidence: 84,
      priority: 2,
      whyItMatters:
        "Trust cues at the buy box remove the last hesitation before a €100+ purchase — this is where ready-to-buy shoppers currently drop off.",
      monthlyLowCents: 1_500_00,
      monthlyHighCents: 2_900_00,
      action: "fix",
    },
    {
      id: "opp-3",
      title: "Add an exit-intent email capture with a first-order incentive",
      category: "email",
      whatToDo:
        "Show a single, well-designed exit-intent popup offering 10% off the first order in exchange for an email.",
      example: "Get 10% off your first order — plus early access to new drops.",
      difficulty: "easy",
      estimatedMinutes: 60,
      confidence: 80,
      priority: 3,
      whyItMatters:
        "Capturing emails turns one-time ad traffic into an owned audience you can market to for free — the foundation every other email win builds on.",
      monthlyLowCents: 1_100_00,
      monthlyHighCents: 2_400_00,
      action: "create_flow",
    },
  ],
  growthOpportunities: [
    {
      id: "opp-4",
      title: "Launch an abandoned-cart email flow",
      category: "email",
      whatToDo:
        "Build a 3-email abandoned-cart sequence (1h, 24h, 72h) with the product image, a trust reminder and a gentle incentive on the final send.",
      example: "Email 1: “Still thinking it over?” · Email 3: “Here's 10% to complete your order.”",
      difficulty: "medium",
      estimatedMinutes: 480,
      confidence: 76,
      priority: 4,
      whyItMatters:
        "Abandoned-cart flows recover revenue you've already paid to acquire — it's consistently the highest-ROI email an ecommerce brand can send.",
      monthlyLowCents: 1_600_00,
      monthlyHighCents: 2_600_00,
      action: "create_flow",
    },
    {
      id: "opp-5",
      title: "Introduce a “complete the look” bundle upsell",
      category: "conversion",
      whatToDo:
        "On product pages, recommend 2–3 complementary pieces as a discounted bundle to lift average order value.",
      example: "Complete the look: necklace + earrings + bracelet — save 15%.",
      difficulty: "medium",
      estimatedMinutes: 600,
      confidence: 70,
      priority: 5,
      whyItMatters:
        "Raising average order value increases revenue on every existing order — without spending a cent more on traffic.",
      monthlyLowCents: 1_900_00,
      monthlyHighCents: 3_300_00,
      action: "create_flow",
    },
  ],
  actionPlan: [
    {
      title: "Week 1 — Fix the first impression",
      detail:
        "Rewrite the homepage hero and add trust signals to the product buy box. These are same-day changes with the highest confidence.",
    },
    {
      title: "Week 2 — Stop losing visitors",
      detail:
        "Launch exit-intent email capture and stand up the abandoned-cart flow to recover traffic you already pay for.",
    },
    {
      title: "Week 3 — Raise order value",
      detail:
        "Add the “complete the look” bundle upsell and measure AOV impact against the prior two weeks.",
    },
  ],
};
