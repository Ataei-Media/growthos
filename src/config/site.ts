import { clientEnv } from "@/lib/env";

/**
 * Static, brand-level configuration shared across marketing pages, metadata,
 * emails and the dashboard shell. Single source of truth for naming and links.
 */
export const siteConfig = {
  name: "GrowthOS",
  category: "Revenue Intelligence Platform",
  tagline: "Find the revenue leaks in your business.",
  description:
    "GrowthOS is a Revenue Intelligence Platform. Enter your website and see exactly where you're losing revenue — and how to win it back — in under two minutes.",
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  ogImage: "/og.png",
  supportEmail: "support@growthos.app",
  links: {
    twitter: "https://twitter.com/growthos",
    linkedin: "https://linkedin.com/company/growthos",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Primary dashboard navigation — consumed by the sidebar in Milestone 4. */
export const dashboardNav = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Audits", href: "/dashboard/audits", icon: "ScanSearch" },
  { title: "Competitors", href: "/dashboard/competitors", icon: "Swords" },
  { title: "Marketing", href: "/dashboard/marketing", icon: "Megaphone" },
  { title: "Reports", href: "/dashboard/reports", icon: "FileText" },
  { title: "Billing", href: "/dashboard/billing", icon: "CreditCard" },
  { title: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const;

export type DashboardNavItem = (typeof dashboardNav)[number];
