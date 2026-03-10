import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { Entry, MonthlySummary } from "../backend.d";
import { useGetEntries, useGetMonthlySummaries } from "../hooks/useQueries";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatYearMonth(ym: string): string {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getMonthEntries(entries: Entry[], yearMonth: string): Entry[] {
  return entries
    .filter((e) => e.date.startsWith(yearMonth))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function exportMonthCSV(summary: MonthlySummary, entries: Entry[]) {
  const monthEntries = getMonthEntries(entries, summary.yearMonth);
  const header = "Date,Invest,Profit,Overall %";
  const rows = monthEntries.map((e) => {
    const profit = e.receivedAmount - e.investAmount;
    const overall = e.investAmount > 0 ? (profit / e.investAmount) * 100 : 0;
    return [
      e.date,
      e.investAmount.toFixed(2),
      profit.toFixed(2),
      overall.toFixed(2),
    ].join(",");
  });
  // Totals row
  const totalInvest = monthEntries.reduce((s, e) => s + e.investAmount, 0);
  const totalProfit = monthEntries.reduce(
    (s, e) => s + (e.receivedAmount - e.investAmount),
    0,
  );
  const totalOverall = totalInvest > 0 ? (totalProfit / totalInvest) * 100 : 0;
  const totalRow = [
    "TOTAL",
    totalInvest.toFixed(2),
    totalProfit.toFixed(2),
    totalOverall.toFixed(2),
  ].join(",");
  const csv = [header, ...rows, "", totalRow].join("\n");
  const filename = `${summary.yearMonth}-profit-report.csv`;
  triggerDownload(filename, csv, "text/csv;charset=utf-8;");
}

function exportMonthDOC(summary: MonthlySummary, entries: Entry[]) {
  const monthEntries = getMonthEntries(entries, summary.yearMonth);
  const totalInvest = monthEntries.reduce((s, e) => s + e.investAmount, 0);
  const totalProfit = monthEntries.reduce(
    (s, e) => s + (e.receivedAmount - e.investAmount),
    0,
  );
  const totalOverall = totalInvest > 0 ? (totalProfit / totalInvest) * 100 : 0;

  const rows = monthEntries
    .map((e) => {
      const profit = e.receivedAmount - e.investAmount;
      const overall = e.investAmount > 0 ? (profit / e.investAmount) * 100 : 0;
      return `
    <tr>
      <td style="padding:6px 10px;border:1px solid #ccc;">${e.date}</td>
      <td style="padding:6px 10px;border:1px solid #ccc;">${formatCurrency(e.investAmount)}</td>
      <td style="padding:6px 10px;border:1px solid #ccc;color:${profit >= 0 ? "#16a34a" : "#dc2626"}">${formatCurrency(profit)}</td>
      <td style="padding:6px 10px;border:1px solid #ccc;color:${overall >= 0 ? "#16a34a" : "#dc2626"}">${overall.toFixed(2)}%</td>
    </tr>`;
    })
    .join("");

  const html = `
<html><head><meta charset="utf-8"><title>${formatYearMonth(summary.yearMonth)} — ProfitTrack</title></head>
<body style="font-family:Arial,sans-serif;">
<h2>ProfitTrack — ${formatYearMonth(summary.yearMonth)}</h2>
<table style="border-collapse:collapse;width:100%;font-size:13px;">
  <thead>
    <tr style="background:#f0f0f0;">
      <th style="padding:6px 10px;border:1px solid #ccc;text-align:left;">Date</th>
      <th style="padding:6px 10px;border:1px solid #ccc;text-align:left;">Invest</th>
      <th style="padding:6px 10px;border:1px solid #ccc;text-align:left;">Profit</th>
      <th style="padding:6px 10px;border:1px solid #ccc;text-align:left;">Overall %</th>
    </tr>
  </thead>
  <tbody>${rows}
    <tr style="background:#e8f5e9;font-weight:bold;">
      <td style="padding:6px 10px;border:1px solid #ccc;">TOTAL</td>
      <td style="padding:6px 10px;border:1px solid #ccc;">${formatCurrency(totalInvest)}</td>
      <td style="padding:6px 10px;border:1px solid #ccc;color:${totalProfit >= 0 ? "#16a34a" : "#dc2626"}">${formatCurrency(totalProfit)}</td>
      <td style="padding:6px 10px;border:1px solid #ccc;color:${totalOverall >= 0 ? "#16a34a" : "#dc2626"}">${totalOverall.toFixed(2)}%</td>
    </tr>
  </tbody>
</table>
</body></html>`;

  triggerDownload(
    `${summary.yearMonth}-profit-report.doc`,
    html,
    "application/msword",
  );
}

function exportMonthPDF(summary: MonthlySummary, entries: Entry[]) {
  const monthEntries = getMonthEntries(entries, summary.yearMonth);
  const totalInvest = monthEntries.reduce((s, e) => s + e.investAmount, 0);
  const totalProfit = monthEntries.reduce(
    (s, e) => s + (e.receivedAmount - e.investAmount),
    0,
  );
  const totalOverall = totalInvest > 0 ? (totalProfit / totalInvest) * 100 : 0;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const rows = monthEntries
    .map((e) => {
      const profit = e.receivedAmount - e.investAmount;
      const overall = e.investAmount > 0 ? (profit / e.investAmount) * 100 : 0;
      return `
    <tr>
      <td>${e.date}</td>
      <td>${formatCurrency(e.investAmount)}</td>
      <td style="color:${profit >= 0 ? "#16a34a" : "#dc2626"}">${formatCurrency(profit)}</td>
      <td style="color:${overall >= 0 ? "#16a34a" : "#dc2626"}">${overall.toFixed(2)}%</td>
    </tr>`;
    })
    .join("");

  printWindow.document.write(`
<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${formatYearMonth(summary.yearMonth)} — ProfitTrack</title>
<style>
  body{font-family:Arial,sans-serif;padding:20px;color:#111;}
  h2{margin-bottom:4px;}p{margin:0 0 16px;color:#555;font-size:13px;}
  table{border-collapse:collapse;width:100%;font-size:13px;}
  th{background:#f0f0f0;padding:8px 12px;border:1px solid #ccc;text-align:left;}
  td{padding:7px 12px;border:1px solid #ddd;}
  .total{background:#e8f5e9;font-weight:bold;}
  @media print{body{padding:0;}}
</style></head><body>
<h2>ProfitTrack — ${formatYearMonth(summary.yearMonth)}</h2>
<p>${monthEntries.length} entries &nbsp;|&nbsp; Total Invested: ${formatCurrency(totalInvest)} &nbsp;|&nbsp; Total Profit: ${formatCurrency(totalProfit)}</p>
<table>
  <thead><tr><th>Date</th><th>Invest</th><th>Profit</th><th>Overall %</th></tr></thead>
  <tbody>
    ${rows}
    <tr class="total">
      <td>TOTAL</td>
      <td>${formatCurrency(totalInvest)}</td>
      <td style="color:${totalProfit >= 0 ? "#16a34a" : "#dc2626"}">${formatCurrency(totalProfit)}</td>
      <td style="color:${totalOverall >= 0 ? "#16a34a" : "#dc2626"}">${totalOverall.toFixed(2)}%</td>
    </tr>
  </tbody>
</table>
</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

interface MonthCardProps {
  summary: MonthlySummary;
  entries: Entry[];
  index: number;
}

function MonthCard({ summary, entries, index }: MonthCardProps) {
  const isPositive = summary.totalProfit >= 0;
  const idx = index + 1;

  return (
    <div
      className={`rounded-xl border bg-card shadow-card p-5 transition-all duration-300 hover:shadow-card-hover ${
        isPositive ? "border-profit/20 glow-profit" : "border-loss/20 glow-loss"
      }`}
      data-ocid={`monthly.item.${idx}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isPositive ? "bg-profit-muted" : "bg-loss-muted"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-profit" />
            ) : (
              <TrendingDown className="w-4 h-4 text-loss" />
            )}
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-foreground">
              {formatYearMonth(summary.yearMonth)}
            </h3>
            <p className="text-xs text-muted-foreground">
              {Number(summary.entryCount)}{" "}
              {Number(summary.entryCount) === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div
              className={`font-display text-xl font-bold ${
                isPositive ? "text-profit" : "text-loss"
              }`}
            >
              {formatPercent(summary.profitPercent)}
            </div>
            <div className="text-xs text-muted-foreground">return</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 border-border text-muted-foreground hover:text-foreground hover:bg-accent gap-1"
                data-ocid={`monthly.export.button.${idx}`}
              >
                <Download className="w-3.5 h-3.5" />
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => exportMonthCSV(summary, entries)}
                data-ocid={`monthly.export.csv.${idx}`}
                className="cursor-pointer text-sm gap-2"
              >
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportMonthPDF(summary, entries)}
                data-ocid={`monthly.export.pdf.${idx}`}
                className="cursor-pointer text-sm gap-2"
              >
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportMonthDOC(summary, entries)}
                data-ocid={`monthly.export.doc.${idx}`}
                className="cursor-pointer text-sm gap-2"
              >
                DOC
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-accent/30 border border-border p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Invested
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(summary.totalInvested)}
          </p>
        </div>
        <div className="rounded-lg bg-accent/30 border border-border p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Received
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(summary.totalReceived)}
          </p>
        </div>
        <div
          className={`rounded-lg border p-3 ${
            isPositive
              ? "bg-profit-muted border-profit/20"
              : "bg-loss-muted border-loss/20"
          }`}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total Profit
          </p>
          <p
            className={`text-sm font-semibold ${
              isPositive ? "text-profit" : "text-loss"
            }`}
          >
            {formatCurrency(summary.totalProfit)}
          </p>
        </div>
        <div className="rounded-lg bg-accent/30 border border-border p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Avg Daily
          </p>
          <p
            className={`text-sm font-semibold ${
              summary.avgDailyProfit >= 0 ? "text-profit" : "text-loss"
            }`}
          >
            {formatPercent(summary.avgDailyProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MonthlyHistory() {
  const { data: summaries, isLoading, isError } = useGetMonthlySummaries();
  const { data: entries = [] } = useGetEntries();

  const sorted = summaries
    ? [...summaries].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
    : [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Monthly History
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Auto-grouped monthly summaries. Click the export button on each
            month to download its full data.
          </p>
        </div>
      </div>

      {isError && (
        <Alert
          variant="destructive"
          className="mb-6"
          data-ocid="monthly.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load monthly summaries. Please refresh.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="monthly.loading_state"
        >
          {[1, 2, 3].map((sk) => (
            <div
              key={sk}
              className="rounded-xl border border-border bg-card p-5"
            >
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading &&
        !isError &&
        (sorted.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card"
            data-ocid="monthly.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-1">
              No monthly data yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Monthly summaries will appear automatically once you have entries
              across different months.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
            {sorted.map((summary, index) => (
              <MonthCard
                key={summary.yearMonth}
                summary={summary}
                entries={entries}
                index={index}
              />
            ))}
          </div>
        ))}
    </main>
  );
}
