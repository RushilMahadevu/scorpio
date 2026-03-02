"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────

const NETWORK_FEE = 4.99;
const AI_COSTS     = [0.65, 3.24, 6.48, 16.20];
const STUDENTS     = [10, 50, 100, 250];

const chartData = STUDENTS.map((n, i) => {
  const ourTotal = parseFloat((NETWORK_FEE + AI_COSTS[i]).toFixed(2));
  return {
    label:       `${n} Students`,
    ourTotal,
    industryLow:  n * 5,
    industryHigh: n * 12,
  };
});

const tableData = STUDENTS.map((n, i) => {
  const ourTotal = parseFloat((NETWORK_FEE + AI_COSTS[i]).toFixed(2));
  const iLow     = n * 5;
  return {
    students:              n,
    ourTotal:              ourTotal.toFixed(2),
    industryLow:           iLow.toFixed(0),
    industryHigh:          (n * 12).toFixed(0),
    ourPerStudent:         (ourTotal / n).toFixed(2),
    savingsPct:            Math.round(((iLow - ourTotal) / iLow) * 100),
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtAxis = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;

const fmtLabel = (v: any) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const meta: Record<string, string> = {
    ourTotal:     "Scorpio Total",
    industryLow:  "Industry Low",
    industryHigh: "Industry High",
  };
  return (
    <div className="bg-background/95 backdrop-blur-2xl border border-border/60 rounded-2xl p-5 shadow-2xl min-w-[200px]">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-4 text-muted-foreground">
        {label}
      </p>
      {payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-8 py-1.5"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-semibold text-foreground">
              {meta[entry.dataKey] ?? entry.name}
            </span>
          </div>
          <span className="text-sm font-black font-mono text-foreground tabular-nums">
            ${Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CostComparisonChart() {
  return (
    <section className="space-y-14">
      {/* Title block */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/50">
          Investor · Admin · Pitch
        </p>
        <h3 className="text-3xl font-black tracking-tighter leading-tight text-foreground">
          Total Monthly Cost Comparison:<br />
          <span className="text-muted-foreground font-medium">Our AI vs Industry Education AI</span>
        </h3>
        <p className="text-sm text-muted-foreground font-medium pt-1">
          Flat $4.99 network fee vs per-student pricing ($5–$12/student)
        </p>
      </div>

      {/* ── Bar Chart ──────────────────────────────────────────────────────── */}
      <div className="w-full rounded-[2.5rem] border border-border/40 bg-card/30 backdrop-blur-md p-8 overflow-hidden">
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 36, right: 24, left: 16, bottom: 8 }}
              barGap={3}
              barCategoryGap="32%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(128,128,128,0.1)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: "rgba(128,128,128,0.15)" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmtAxis}
                tick={{ fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(128,128,128,0.04)" }}
              />
              <Legend
                formatter={(value) => (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {value}
                  </span>
                )}
                wrapperStyle={{ paddingTop: "20px" }}
              />

              {/* Our Total — emerald */}
              <Bar
                dataKey="ourTotal"
                name="Scorpio"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="ourTotal"
                  position="top"
                  formatter={fmtLabel}
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    fill: "#10b981",
                    fontFamily: "monospace",
                  }}
                />
              </Bar>

              {/* Industry Low — amber */}
              <Bar
                dataKey="industryLow"
                name="Industry Low"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="industryLow"
                  position="top"
                  formatter={fmtLabel}
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    fill: "#f59e0b",
                    fontFamily: "monospace",
                  }}
                />
              </Bar>

              {/* Industry High — red */}
              <Bar
                dataKey="industryHigh"
                name="Industry High"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="industryHigh"
                  position="top"
                  formatter={fmtLabel}
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    fill: "#ef4444",
                    fontFamily: "monospace",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Comparison Table ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/30 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                {[
                  ["Students",          "text-left",  "text-muted-foreground"],
                  ["Scorpio Total",     "text-right", "text-emerald-500"],
                  ["Industry Low",      "text-right", "text-amber-500"],
                  ["Industry High",     "text-right", "text-red-500"],
                  ["Our $/Student",     "text-right", "text-muted-foreground"],
                  ["Industry $/Student","text-right", "text-muted-foreground"],
                  ["Savings vs Low",    "text-right", "text-muted-foreground"],
                ].map(([label, align, color]) => (
                  <th
                    key={label}
                    className={cn(
                      "px-6 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                      align,
                      color
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 last:border-none hover:bg-muted/10 transition-colors"
                >
                  <td className="px-6 py-5 font-black text-foreground tabular-nums">
                    {row.students}
                  </td>
                  <td className="px-6 py-5 text-right font-black font-mono text-emerald-500 tabular-nums">
                    ${row.ourTotal}
                  </td>
                  <td className="px-6 py-5 text-right font-black font-mono text-amber-500 tabular-nums">
                    ${row.industryLow}
                  </td>
                  <td className="px-6 py-5 text-right font-black font-mono text-red-500 tabular-nums">
                    ${row.industryHigh}
                  </td>
                  <td className="px-6 py-5 text-right text-xs font-black font-mono text-foreground/60 tabular-nums">
                    ${row.ourPerStudent}
                  </td>
                  <td className="px-6 py-5 text-right text-xs font-black font-mono text-foreground/60">
                    $5.00 – $12.00
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="inline-flex items-center bg-emerald-500/10 text-emerald-500 font-black text-[10px] px-3 py-1.5 rounded-full border border-emerald-500/20 tabular-nums">
                      {row.savingsPct}% cheaper
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── KPI Summary Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            value: "98.3%",
            label: "Max Cost Reduction",
            sub:   "at 250 students vs industry low",
            accent: "emerald",
          },
          {
            value: "$11.47",
            label: "Our Cost at 100 Students",
            sub:   "industry charges $500 – $1,200",
            accent: "primary",
          },
          {
            value: "$0.08",
            label: "Effective Per-Student Rate",
            sub:   "at 250 students total",
            accent: "blue",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={cn(
              "p-7 rounded-[2rem] border backdrop-blur-sm text-center space-y-1.5 bg-card/30",
              kpi.accent === "emerald"
                ? "border-emerald-500/25 bg-emerald-500/5"
                : kpi.accent === "blue"
                ? "border-blue-500/20 bg-blue-500/5"
                : "border-border/40"
            )}
          >
            <p
              className={cn(
                "text-4xl font-black tracking-tighter",
                kpi.accent === "emerald"
                  ? "text-emerald-500"
                  : kpi.accent === "blue"
                  ? "text-blue-400"
                  : "text-foreground"
              )}
            >
              {kpi.value}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
              {kpi.label}
            </p>
            <p className="text-xs text-muted-foreground italic">{kpi.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
