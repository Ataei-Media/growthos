import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/report/report-view";
import { AnalyzingReport } from "@/components/report/analyzing";
import { sampleReport } from "@/features/report/sample";
import { getReport, markReportPaid } from "@/features/report/service";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { flags } from "@/lib/flags";
import { sendPurchaseSequence } from "@/lib/email/resend";
import { trackServer } from "@/lib/analytics/posthog";

export const metadata: Metadata = {
  title: "Revenue Report",
  robots: { index: false, follow: false },
};

/** Verify a returning Checkout session and unlock (fallback if webhook lags). */
async function reconcileCheckout(id: string, sessionId: string) {
  if (!isStripeConfigured()) return;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid" && session.metadata?.reportId === id) {
      await markReportPaid(id, {
        email: session.customer_details?.email ?? null,
        paymentIntent:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        amountCents: session.amount_total ?? null,
      });
      await trackServer("payment_completed", id, { via: "return" });
      const email = session.customer_details?.email;
      const brandName = session.metadata?.brandName ?? "your store";
      if (email) await sendPurchaseSequence({ to: email, brandName, reportId: id });
    }
  } catch {
    /* webhook remains the source of truth */
  }
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locked?: string; checkout?: string; session_id?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  // Sample (design review, dev only).
  if (id === "sample") {
    if (process.env.NODE_ENV === "production") notFound();
    return (
      <ReportView
        report={sampleReport}
        reportId="sample"
        paid={sp.locked !== "1"}
        createdAt={new Date().toISOString()}
      />
    );
  }

  if (sp.checkout === "success" && sp.session_id) {
    await reconcileCheckout(id, sp.session_id);
  }

  const record = await getReport(id);
  if (!record) notFound();

  if (record.status === "generating") {
    return <AnalyzingReport reportId={id} />;
  }

  if (record.status === "failed" || !record.report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This report couldn&apos;t be generated
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The site may be unreachable. Please start a new analysis.
        </p>
        <Link href="/" className="mt-6 text-sm font-medium text-accent hover:underline">
          Start over
        </Link>
      </div>
    );
  }

  // The report is free unless the paywall flag is explicitly enabled.
  const unlocked = record.paid || !flags.reportPaywall;

  // Ethical urgency only applies while a paywall exists.
  const PREVIEW_TTL_MS = 24 * 60 * 60 * 1000;
  const expired =
    !unlocked && Date.now() - new Date(record.createdAt).getTime() > PREVIEW_TTL_MS;

  if (expired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This free preview has expired
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Previews are kept for 24 hours. Re-run the analysis to see your current
          revenue opportunities — it only takes a couple of minutes.
        </p>
        <Link
          href={`/start?url=${encodeURIComponent(record.url)}`}
          className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Re-run my analysis
        </Link>
      </div>
    );
  }

  return (
    <ReportView
      report={record.report}
      reportId={id}
      paid={unlocked}
      createdAt={record.createdAt}
    />
  );
}

