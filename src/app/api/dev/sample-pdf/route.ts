import { createElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ReportDocument } from "@/lib/pdf/report-document";
import { sampleReport } from "@/features/report/sample";

/** Dev-only: render the sample report to PDF for design review. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }
  const element = createElement(ReportDocument, {
    report: sampleReport,
  }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="sample-revenue-report.pdf"',
    },
  });
}
