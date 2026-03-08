import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  DollarSign,
  Loader2,
  Percent,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import StatCard from "../components/StatCard";
import { useAddEntry, useGetSummary } from "../hooks/useQueries";

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

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function Dashboard() {
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetSummary();
  const addEntry = useAddEntry();

  const [date, setDate] = useState(getTodayDate());
  const [investAmount, setInvestAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const invest = Number.parseFloat(investAmount);
    const received = Number.parseFloat(receivedAmount);

    if (!date) {
      setFormError("Please select a date.");
      return;
    }
    if (Number.isNaN(invest) || invest < 0) {
      setFormError("Investment amount must be a non-negative number.");
      return;
    }
    if (Number.isNaN(received) || received < 0) {
      setFormError("Received amount must be a non-negative number.");
      return;
    }

    try {
      await addEntry.mutateAsync({
        date,
        investAmount: invest,
        receivedAmount: received,
      });
      setFormSuccess(true);
      setInvestAmount("");
      setReceivedAmount("");
      setDate(getTodayDate());
      toast.success("Entry added successfully!");
      setTimeout(() => setFormSuccess(false), 3000);
    } catch {
      setFormError("Failed to add entry. Please try again.");
      toast.error("Failed to add entry.");
    }
  }

  const profitSentiment = !summary
    ? "neutral"
    : summary.totalProfit > 0
      ? "profit"
      : summary.totalProfit < 0
        ? "loss"
        : "neutral";

  const pctSentiment = !summary
    ? "neutral"
    : summary.profitPercentage > 0
      ? "profit"
      : summary.profitPercentage < 0
        ? "loss"
        : "neutral";

  const avgSentiment = !summary
    ? "neutral"
    : summary.averageDailyProfitPercentage > 0
      ? "profit"
      : summary.averageDailyProfitPercentage < 0
        ? "loss"
        : "neutral";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track your investment performance and daily profitability
        </p>
      </div>

      {/* Summary Error */}
      {summaryError && (
        <Alert
          variant="destructive"
          className="mb-6"
          data-ocid="summary.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load summary data. Please refresh.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton for summary */}
      {summaryLoading && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-8"
          data-ocid="summary.loading_state"
        >
          {["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
            <div
              key={sk}
              className="rounded-xl border border-border bg-card p-5"
            >
              <Skeleton className="h-3 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      {!summaryLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
          <StatCard
            label="Total Investment"
            value={summary ? formatCurrency(summary.totalInvest) : "$0.00"}
            icon={DollarSign}
            sentiment="neutral"
            delay={0}
          />
          <StatCard
            label="Total Received"
            value={summary ? formatCurrency(summary.totalReceived) : "$0.00"}
            subLabel="Overall income"
            icon={BarChart2}
            sentiment="neutral"
            delay={60}
          />
          <StatCard
            label="Total Profit"
            value={summary ? formatCurrency(summary.totalProfit) : "$0.00"}
            subLabel={
              summary && summary.totalInvest > 0
                ? `On ${formatCurrency(summary.totalInvest)} invested`
                : undefined
            }
            icon={
              summary && summary.totalProfit >= 0 ? TrendingUp : TrendingDown
            }
            sentiment={profitSentiment}
            delay={120}
          />
          <StatCard
            label="Overall Profit %"
            value={summary ? formatPercent(summary.profitPercentage) : "0.00%"}
            subLabel="Total return on investment"
            icon={Percent}
            sentiment={pctSentiment}
            delay={180}
          />
          <StatCard
            label="Average Daily Profit %"
            value={
              summary
                ? formatPercent(summary.averageDailyProfitPercentage)
                : "0.00%"
            }
            subLabel="Mean daily performance"
            icon={Activity}
            sentiment={avgSentiment}
            delay={240}
          />
        </div>
      )}

      {/* Add Entry Form */}
      <div
        className="max-w-xl animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        <div className="rounded-xl border border-border bg-card shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-profit" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-foreground">
                Add Daily Entry
              </h2>
              <p className="text-xs text-muted-foreground">
                Record your investment and returns
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="entry-date"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Date
              </Label>
              <Input
                id="entry-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-input/50 border-border focus:border-primary/60"
                data-ocid="entry.date.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="invest-amount"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Investment Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  $
                </span>
                <Input
                  id="invest-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="pl-7 bg-input/50 border-border focus:border-primary/60"
                  data-ocid="entry.invest.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="received-amount"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Total Received Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  $
                </span>
                <Input
                  id="received-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="pl-7 bg-input/50 border-border focus:border-primary/60"
                  data-ocid="entry.received.input"
                />
              </div>
            </div>

            {/* Inline profit preview */}
            {investAmount && receivedAmount && (
              <div
                className={`rounded-lg p-3 border text-sm flex items-center justify-between ${
                  Number.parseFloat(receivedAmount) -
                    Number.parseFloat(investAmount) >=
                  0
                    ? "border-profit/20 bg-profit-muted text-profit"
                    : "border-loss/20 bg-loss-muted text-loss"
                }`}
              >
                <span className="font-medium">Projected Profit</span>
                <span className="font-display font-bold">
                  {formatCurrency(
                    Number.parseFloat(receivedAmount || "0") -
                      Number.parseFloat(investAmount || "0"),
                  )}{" "}
                  (
                  {Number.parseFloat(investAmount) > 0
                    ? formatPercent(
                        ((Number.parseFloat(receivedAmount || "0") -
                          Number.parseFloat(investAmount || "0")) /
                          Number.parseFloat(investAmount)) *
                          100,
                      )
                    : "0.00%"}
                  )
                </span>
              </div>
            )}

            {/* Error state */}
            {formError && (
              <Alert variant="destructive" data-ocid="entry.error_state">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Success state */}
            {formSuccess && (
              <div
                className="flex items-center gap-2 rounded-lg p-3 border border-profit/20 bg-profit-muted text-profit text-sm font-medium"
                data-ocid="entry.success_state"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Entry recorded successfully.
              </div>
            )}

            {/* Loading state */}
            {addEntry.isPending && (
              <div
                className="flex items-center gap-2 text-muted-foreground text-sm"
                data-ocid="entry.loading_state"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving entry...
              </div>
            )}

            <Button
              type="submit"
              disabled={addEntry.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all"
              data-ocid="entry.submit_button"
            >
              {addEntry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Entry
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
