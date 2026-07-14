/**
 * Content model for the marketing site. Copy lives here (not in components) so
 * sections stay presentational and content is easy to iterate or localise.
 * Every section answers one objection.
 */

export const marketingNav = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

/** The three intelligence pillars (never "AI features"). */
export const intelligencePillars = [
  {
    id: "conversion",
    icon: "MousePointerClick",
    title: "Conversion Intelligence",
    description:
      "We inspect your homepage, product pages, CTAs and checkout the way a senior CRO specialist would — and quantify every leak in the funnel.",
  },
  {
    id: "growth",
    icon: "TrendingUp",
    title: "Growth Intelligence",
    description:
      "SEO, paid ads and email, audited together — so your channels compound revenue instead of quietly competing for the same budget.",
  },
  {
    id: "revenue",
    icon: "Coins",
    title: "Revenue Intelligence",
    description:
      "A prioritised plan with the estimated revenue impact behind every fix, so you always know the single most valuable thing to do next.",
  },
] as const;

export const howItWorks = [
  {
    step: 1,
    title: "Enter your URL",
    description:
      "Paste your website. No setup, no tracking code, no sales call — nothing to install.",
  },
  {
    step: 2,
    title: "We read your site like a buyer",
    description:
      "GrowthOS crawls your pages, captures your funnel and analyses 14 growth dimensions end to end.",
  },
  {
    step: 3,
    title: "Get your Revenue Report",
    description:
      "A complete, prioritised growth report — every fix and the revenue behind it — in under two minutes.",
  },
] as const;

/** Honest, non-fabricated proof points framed as platform capability. */
export const proofPoints = [
  { value: "14", label: "growth dimensions analysed" },
  { value: "< 2 min", label: "from URL to full report" },
  { value: "4-in-1", label: "CRO · SEO · Ads · Email" },
] as const;

export interface PricingTier {
  id: "free" | "growth" | "agency" | "enterprise";
  name: string;
  priceLabel: string;
  priceSuffix?: string;
  blurb: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "€0",
    blurb: "See what you're leaving on the table.",
    features: [
      "One complete Revenue Audit",
      "Overall + category scores",
      "Your top 3 revenue priorities",
      "Community support",
    ],
    cta: "Start free",
    href: "/login",
  },
  {
    id: "growth",
    name: "Growth",
    priceLabel: "€149",
    priceSuffix: "/month",
    blurb: "For brands actively scaling revenue.",
    features: [
      "Unlimited audits",
      "Full analysis — all 14 dimensions",
      "Revenue opportunity sizing",
      "Competitor analysis",
      "PDF export",
      "Email support",
    ],
    cta: "Start Growth",
    href: "/login",
    highlighted: true,
  },
  {
    id: "agency",
    name: "Agency",
    priceLabel: "€399",
    priceSuffix: "/month",
    blurb: "For teams and agencies managing many brands.",
    features: [
      "Everything in Growth",
      "10 team seats",
      "White-label reports",
      "Marketing asset generator",
      "Priority support",
    ],
    cta: "Start Agency",
    href: "/login",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    blurb: "For high-volume platforms and marketplaces.",
    features: [
      "Everything in Agency",
      "Unlimited seats",
      "API access",
      "SSO, SLA & security review",
      "Dedicated success manager",
    ],
    cta: "Contact sales",
    href: "mailto:sales@growthos.app",
  },
];

export const faqs = [
  {
    q: "How is this different from a generic SEO or speed test?",
    a: "Speed tests grade your site. GrowthOS grades your revenue. We connect every finding — copy, trust, CTAs, checkout, SEO, ads, email — to the money it's costing you, then rank fixes by impact.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. There's no script, no tag and no integration to set up. You paste your URL and we analyse your public pages directly.",
  },
  {
    q: "How accurate are the revenue estimates?",
    a: "Each opportunity is a grounded range based on your funnel and category benchmarks, not a made-up number. It's there to help you prioritise — the biggest wins first.",
  },
  {
    q: "Is my data safe?",
    a: "We only read publicly accessible pages, we never touch your customer data, and you can delete an audit or your account at any time.",
  },
  {
    q: "How long does an audit take?",
    a: "Under two minutes from the moment you submit your URL to a complete, prioritised report.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Plans are self-serve and month-to-month — upgrade, downgrade or cancel in a couple of clicks, no lock-in.",
  },
] as const;

export const footerNav = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "mailto:hello@growthos.app" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
} as const;
