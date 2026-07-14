import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/report/onboarding-wizard";

export const metadata: Metadata = {
  title: "Personalise your report",
  robots: { index: false, follow: false },
};

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;

  // A URL is required to personalise; without one, send them back to the top.
  if (!url) redirect("/");

  return <OnboardingWizard url={url} />;
}
