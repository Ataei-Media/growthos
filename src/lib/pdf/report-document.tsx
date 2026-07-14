import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Svg,
  Circle,
  Path,
  Rect,
  G,
} from "@react-pdf/renderer";
import { CATEGORY_LABELS, type RevenueReport } from "@/features/report/types";
import {
  DIFFICULTY_LABEL,
  formatMinutes,
  formatRange,
  scoreTone,
} from "@/features/report/format";

/* Print palette (no CSS vars in PDF). Slightly darkened for paper contrast. */
const C = {
  bg: "#FFFFFF",
  ink: "#0F172A",
  soft: "#475569",
  faint: "#94A3B8",
  border: "#E2E8F0",
  card: "#F8FAFC",
  accent: "#2563EB",
  success: "#15803D",
  warning: "#B45309",
  danger: "#B91C1C",
  ink2: "#111111",
};

const toneHex: Record<string, string> = {
  strong: C.success,
  ok: C.accent,
  weak: C.warning,
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.ink,
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 54,
    paddingBottom: 60,
    paddingHorizontal: 54,
    lineHeight: 1.5,
  },
  cover: {
    backgroundColor: C.bg,
    color: C.ink,
    fontFamily: "Helvetica",
    padding: 54,
    height: "100%",
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: C.accent,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  h1: { fontSize: 30, fontFamily: "Helvetica-Bold", color: C.ink2 },
  h2: { fontSize: 15, fontFamily: "Helvetica-Bold", color: C.ink2 },
  h3: { fontSize: 11.5, fontFamily: "Helvetica-Bold", color: C.ink2 },
  muted: { color: C.soft },
  faint: { color: C.faint },
  card: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: C.card,
    padding: 16,
  },
  label: {
    fontSize: 7.5,
    letterSpacing: 0.8,
    color: C.faint,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 54,
    right: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: C.faint,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  row: { flexDirection: "row" },
  logoMark: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: C.border,
    marginRight: 6,
  },
});

function Mark({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} style={{ marginRight: 6 }}>
      <Rect
        x={0.75}
        y={0.75}
        width={size - 1.5}
        height={size - 1.5}
        rx={4}
        stroke={C.border}
        strokeWidth={1.2}
        fill="none"
      />
      <Path
        d="M4 11 L7 8 L9 9.5 L12 5.5"
        stroke={C.accent}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Donut({ score, size = 130 }: { score: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * (Math.max(0, Math.min(100, score)) / 100);
  const color = toneHex[scoreTone(score)];
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Svg width={size} height={size}>
        <G transform={`rotate(-90 ${cx} ${cx})`}>
          <Circle cx={cx} cy={cx} r={r} stroke={C.border} strokeWidth={stroke} fill="none" />
          <Circle
            cx={cx}
            cy={cx}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
          />
        </G>
      </Svg>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 30, fontFamily: "Helvetica-Bold", color: C.ink2 }}>{score}</Text>
        <Text style={{ fontSize: 8, color: C.soft }}>Revenue Score</Text>
      </View>
    </View>
  );
}

function Bar({ category, score }: { category: string; score: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, width: "48%" }}>
      <Text style={{ width: 96, fontSize: 9, color: C.soft }}>
        {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
      </Text>
      <View style={{ flex: 1, height: 5, backgroundColor: C.border, borderRadius: 3 }}>
        <View
          style={{
            width: `${score}%`,
            height: 5,
            backgroundColor: toneHex[scoreTone(score)],
            borderRadius: 3,
          }}
        />
      </View>
      <Text style={{ width: 20, textAlign: "right", fontSize: 9, fontFamily: "Helvetica-Bold" }}>
        {score}
      </Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text>GrowthOS · Revenue Intelligence Report · Confidential</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <Text style={[s.eyebrow, { marginBottom: 6 }]}>{children}</Text>;
}

export function ReportDocument({ report }: { report: RevenueReport }) {
  let host = report.url;
  try {
    host = new URL(report.url).host;
  } catch {
    /* keep */
  }
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document
      title={`Revenue Report — ${report.brandName}`}
      author="GrowthOS"
      subject="Revenue Intelligence Report"
    >
      {/* Cover */}
      <Page size="A4" style={s.cover}>
        <View style={[s.row, { alignItems: "center" }]}>
          <Mark />
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold" }}>GrowthOS</Text>
        </View>

        <View style={{ marginTop: 150 }}>
          <Eyebrow>Revenue Intelligence Report</Eyebrow>
          <Text style={s.h1}>{report.brandName}</Text>
          <Text style={[s.muted, { marginTop: 4, fontSize: 11 }]}>{host}</Text>
        </View>

        <View
          style={{
            marginTop: 40,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Donut score={report.overallScore} />
          <View style={{ width: 250 }}>
            <Text style={s.label}>Estimated revenue opportunity</Text>
            <Text style={{ fontSize: 26, fontFamily: "Helvetica-Bold", color: C.ink2 }}>
              {formatRange(report.totalMonthlyLowCents, report.totalMonthlyHighCents)}
            </Text>
            <Text style={s.muted}>per month</Text>
          </View>
        </View>

        <View style={{ position: "absolute", bottom: 54, left: 54, right: 54 }}>
          <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 }}>
            <Text style={s.faint}>Prepared by GrowthOS · {date} · Confidential</Text>
          </View>
        </View>
      </Page>

      {/* Summary + health */}
      <Page size="A4" style={s.page}>
        <Eyebrow>Executive summary</Eyebrow>
        <Text style={{ fontSize: 11.5, lineHeight: 1.6 }}>{report.executiveSummary}</Text>

        <View style={{ height: 22 }} />
        <Text style={s.h2}>Website health</Text>
        <View
          style={[
            s.card,
            { marginTop: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
          ]}
        >
          {report.scores.map((sc) => (
            <Bar key={sc.category} category={sc.category} score={sc.score} />
          ))}
        </View>

        <View style={{ height: 20 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {[
            { k: "Critical issues", v: String(report.criticalIssues.length) },
            { k: "Quick wins", v: String(report.quickWins.length) },
            { k: "Growth opportunities", v: String(report.growthOpportunities.length) },
          ].map((stat) => (
            <View key={stat.k} style={[s.card, { width: "31%" }]}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "Helvetica-Bold",
                  color: C.ink2,
                  lineHeight: 1,
                  marginBottom: 5,
                }}
              >
                {stat.v}
              </Text>
              <Text style={s.muted}>{stat.k}</Text>
            </View>
          ))}
        </View>
        <Footer />
      </Page>

      {/* Critical issues */}
      <Page size="A4" style={s.page}>
        <Eyebrow>Critical issues</Eyebrow>
        <Text style={s.h2}>{report.criticalIssues.length} issues costing you revenue</Text>
        <View style={{ height: 12 }} />
        {report.criticalIssues.map((issue, i) => (
          <View key={issue.id} style={[s.card, { marginBottom: 12 }]} wrap={false}>
            <View style={[s.row, { alignItems: "center", marginBottom: 6 }]}>
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: issue.severity === "critical" ? C.danger : C.warning,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                {i + 1}. {issue.severity === "critical" ? "Critical" : "High impact"}
              </Text>
              <Text style={[s.faint, { marginLeft: 8, fontSize: 8 }]}>
                {CATEGORY_LABELS[issue.category]}
              </Text>
            </View>
            <Text style={[s.h3, { marginBottom: 8 }]}>{issue.title}</Text>
            <View style={s.row}>
              <View style={{ width: "33%", paddingRight: 8 }}>
                <Text style={s.label}>Current situation</Text>
                <Text style={{ fontSize: 9 }}>{issue.currentSituation}</Text>
              </View>
              <View style={{ width: "33%", paddingRight: 8 }}>
                <Text style={s.label}>The problem</Text>
                <Text style={{ fontSize: 9 }}>{issue.problem}</Text>
              </View>
              <View style={{ width: "34%" }}>
                <Text style={s.label}>Why it costs you</Text>
                <Text style={{ fontSize: 9 }}>{issue.whyItHurts}</Text>
              </View>
            </View>
          </View>
        ))}
        <Footer />
      </Page>

      {/* Opportunities + action plan */}
      <Page size="A4" style={s.page}>
        <Eyebrow>Quick wins</Eyebrow>
        <Text style={s.h2}>High impact, low effort</Text>
        <View style={{ height: 12 }} />
        {[...report.quickWins, ...report.growthOpportunities].map((o) => (
          <View key={o.id} style={[s.card, { marginBottom: 10 }]} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[s.h3, { width: "70%" }]}>{o.title}</Text>
              <Text style={{ fontFamily: "Helvetica-Bold", color: C.success }}>
                +{formatRange(o.monthlyLowCents, o.monthlyHighCents)}/mo
              </Text>
            </View>
            <Text style={[s.faint, { fontSize: 8, marginTop: 3 }]}>
              Priority {o.priority} · {DIFFICULTY_LABEL[o.difficulty]} ·{" "}
              {formatMinutes(o.estimatedMinutes)} · {o.confidence}% confidence ·{" "}
              {CATEGORY_LABELS[o.category]}
            </Text>
            <Text style={{ fontSize: 9, marginTop: 6 }}>{o.whatToDo}</Text>
            <Text style={{ fontSize: 8.5, marginTop: 4, color: C.soft }}>
              Why it matters: {o.whyItMatters}
            </Text>
            <Text style={{ fontSize: 9, marginTop: 4, fontStyle: "italic", color: C.soft }}>
              Example: {o.example}
            </Text>
          </View>
        ))}

        <View style={{ height: 8 }} />
        <Eyebrow>Action plan</Eyebrow>
        <Text style={s.h2}>Your next three weeks</Text>
        <View style={{ height: 10 }} />
        {report.actionPlan.map((step, i) => (
          <View key={step.title} style={[s.card, { marginBottom: 8 }]} wrap={false}>
            <Text style={s.h3}>
              {i + 1}. {step.title}
            </Text>
            <Text style={{ fontSize: 9, marginTop: 3 }}>{step.detail}</Text>
          </View>
        ))}
        <Footer />
      </Page>
    </Document>
  );
}
