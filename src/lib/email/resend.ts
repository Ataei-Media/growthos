import "server-only";
import { Resend } from "resend";
import { clientEnv, getServerEnv } from "@/lib/env";
import { SUBSCRIPTION } from "@/config/pricing";

function resendConfigured(apiKey: string) {
  return Boolean(apiKey) && !apiKey.includes("placeholder");
}

function layout(inner: string): string {
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111111">
    <p style="font-size:12px;letter-spacing:1px;color:#2563EB;text-transform:uppercase;font-weight:600">GrowthOS · Revenue Intelligence</p>
    ${inner}
    <p style="color:#94A3B8;font-size:13px;margin-top:28px">— The GrowthOS team</p>
  </div>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="background:#111111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">${label}</a>`;
}

/**
 * Post-purchase drip. Email 1 sends immediately; 2–4 are scheduled natively by
 * Resend via `scheduledAt`, so no cron/queue is required.
 */
export async function sendPurchaseSequence(params: {
  to: string;
  brandName: string;
  reportId: string;
}): Promise<void> {
  const env = getServerEnv();
  if (!resendConfigured(env.RESEND_API_KEY)) return;

  const resend = new Resend(env.RESEND_API_KEY);
  const base = clientEnv.NEXT_PUBLIC_APP_URL;
  const reportUrl = `${base}/report/${params.reportId}`;
  const pdfUrl = `${reportUrl}/pdf`;
  const from = env.RESEND_FROM_EMAIL;

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const at = (offset: number) => new Date(now + offset).toISOString();

  const sequence: { subject: string; html: string; scheduledAt?: string }[] = [
    {
      subject: `Your Revenue Report for ${params.brandName} is ready`,
      html: layout(`
        <h1 style="font-size:22px;margin:8px 0 4px">Your report is unlocked</h1>
        <p style="color:#475569;line-height:1.6">Every critical issue, quick win and growth opportunity — with the revenue behind each — is ready.</p>
        <p style="margin:24px 0">${button(reportUrl, "View your report")} &nbsp; <a href="${pdfUrl}" style="color:#2563EB;text-decoration:none;font-weight:600">Download PDF</a></p>
        <p style="color:#94A3B8;font-size:13px">Keep this email — your report stays at the link above.</p>`),
    },
    {
      subject: `How to action your ${params.brandName} report`,
      scheduledAt: at(1 * DAY),
      html: layout(`
        <h1 style="font-size:22px;margin:8px 0 4px">Start with priority 1</h1>
        <p style="color:#475569;line-height:1.6">The fastest path to results: implement your report top-down. Do the priority-1 quick win first — it's the highest-confidence, lowest-effort revenue in the whole report.</p>
        <p style="margin:24px 0">${button(reportUrl, "Open my action plan")}</p>`),
    },
    {
      subject: `The wins brands like ${params.brandName} make first`,
      scheduledAt: at(3 * DAY),
      html: layout(`
        <h1 style="font-size:22px;margin:8px 0 4px">Small changes, real revenue</h1>
        <p style="color:#475569;line-height:1.6">The brands that grow fastest don't do everything — they ship the top few fixes and measure. Your report already ranks them by impact and confidence, so you know exactly where to start.</p>
        <p style="margin:24px 0">${button(reportUrl, "Review my top fixes")}</p>`),
    },
    {
      subject: `Audit every store — ${SUBSCRIPTION.name}`,
      scheduledAt: at(6 * DAY),
      html: layout(`
        <h1 style="font-size:22px;margin:8px 0 4px">Run this on every store you touch</h1>
        <p style="color:#475569;line-height:1.6">${SUBSCRIPTION.blurb} Unlimited Revenue Reports for ${SUBSCRIPTION.priceLabel}/${SUBSCRIPTION.interval} — cancel anytime.</p>
        <p style="margin:24px 0">${button(`${base}/login?redirect=/dashboard/billing`, `Get ${SUBSCRIPTION.name}`)}</p>`),
    },
  ];

  for (const email of sequence) {
    try {
      await resend.emails.send({
        from,
        to: params.to,
        subject: email.subject,
        html: email.html,
        ...(email.scheduledAt ? { scheduledAt: email.scheduledAt } : {}),
      });
    } catch {
      /* best-effort per email; a failure of one shouldn't block the rest */
    }
  }
}
