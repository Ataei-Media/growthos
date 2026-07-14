import { NextResponse } from "next/server";
import { attachCheckoutSession, getReport } from "@/features/report/service";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { clientEnv } from "@/lib/env";
import {
  REPORT_CURRENCY,
  REPORT_PRICE_CENTS,
  REPORT_PRODUCT_NAME,
} from "@/config/pricing";
import { trackServer } from "@/lib/analytics/posthog";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = clientEnv.NEXT_PUBLIC_APP_URL;

  const record = await getReport(id);
  if (!record) return NextResponse.redirect(`${base}/`);
  if (record.paid) return NextResponse.redirect(`${base}/report/${id}`);
  if (!isStripeConfigured()) {
    return NextResponse.redirect(`${base}/report/${id}?error=payments_unavailable`);
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: REPORT_CURRENCY,
          unit_amount: REPORT_PRICE_CENTS,
          product_data: {
            name: REPORT_PRODUCT_NAME,
            description: `Full Revenue Intelligence Report for ${record.brandName ?? record.url}`,
          },
        },
      },
    ],
    success_url: `${base}/report/${id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/report/${id}`,
    metadata: { reportId: id, brandName: record.brandName ?? "" },
  });

  await attachCheckoutSession(id, session.id);
  await trackServer("payment_started", id, {});

  return NextResponse.redirect(session.url ?? `${base}/report/${id}`, { status: 303 });
}
