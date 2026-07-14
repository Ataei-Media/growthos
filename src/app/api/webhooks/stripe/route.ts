import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { getServerEnv } from "@/lib/env";
import { markReportPaid } from "@/features/report/service";
import { sendPurchaseSequence } from "@/lib/email/resend";
import { trackServer } from "@/lib/analytics/posthog";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const env = getServerEnv();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reportId = session.metadata?.reportId;

    if (reportId && session.payment_status === "paid") {
      const email = session.customer_details?.email ?? null;
      await markReportPaid(reportId, {
        email,
        paymentIntent:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        amountCents: session.amount_total ?? null,
      });
      await trackServer("payment_completed", reportId, { via: "webhook" });

      const brandName = session.metadata?.brandName || "your store";
      if (email) await sendPurchaseSequence({ to: email, brandName, reportId });
    }
  }

  return NextResponse.json({ received: true });
}
