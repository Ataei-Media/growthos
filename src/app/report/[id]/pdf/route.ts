import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ReportDocument } from "@/lib/pdf/report-document";
import { sampleReport } from "@/features/report/sample";
import { getReport } from "@/features/report/service";
import { trackServer } from "@/lib/analytics/posthog";
import type { RevenueReport } from "@/features/report/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let report: RevenueReport;

  if (id === "sample") {
    if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
    report = sampleReport;
  } else {
    const record = await getReport(id);
    if (!record || !record.report) return new Response("Not found", { status: 404 });
    if (!record.paid) return new Response("Payment required", { status: 402 });
    report = record.report;
    await trackServer("report_downloaded", id, {});
  }

  const element = createElement(ReportDocument, {
    report,
  }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  const slug = (report.brandName || "growthos").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="revenue-report-${slug}.pdf"`,
    },
  });
}
