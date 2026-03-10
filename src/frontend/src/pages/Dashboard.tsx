import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  DollarSign,
  History as HistoryIcon,
  Loader2,
  Percent,
  PlusCircle,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Entry } from "../backend.d";
import StatCard from "../components/StatCard";
import {
  useAddEntry,
  useDeleteEntry,
  useGetDashboardStats,
  useGetEntries,
} from "../hooks/useQueries";

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

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

interface DashboardProps {
  username: string;
}

interface EntryRowProps {
  entry: Entry;
  index: number;
  onDelete: (id: bigint) => Promise<void>;
  isDeleting: boolean;
}

function EntryRow({ entry, index, onDelete, isDeleting }: EntryRowProps) {
  const profit = entry.receivedAmount - entry.investAmount;
  const profitPct =
    entry.investAmount > 0 ? (profit / entry.investAmount) * 100 : 0;
  const isPositive = profit >= 0;
  const idx = index + 1;

  return (
    <TableRow
      className="border-border hover:bg-accent/30 transition-colors group"
      data-ocid={`dashboard.history.row.${idx}`}
    >
      <TableCell className="font-medium text-foreground text-xs py-2.5">
        {formatDate(entry.date)}
      </TableCell>
      <TableCell className="text-xs text-foreground/80 py-2.5">
        {formatCurrency(entry.investAmount)}
      </TableCell>
      <TableCell className="text-xs text-foreground/80 py-2.5">
        {formatCurrency(entry.receivedAmount)}
      </TableCell>
      <TableCell className="py-2.5">
        <div
          className={`flex items-center gap-1 font-semibold text-xs ${
            isPositive ? "text-profit" : "text-loss"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {formatCurrency(profit)}
        </div>
      </TableCell>
      <TableCell className="py-2.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            isPositive
              ? "bg-profit-muted text-profit border border-profit/20"
              : "bg-loss-muted text-loss border border-loss/20"
          }`}
        >
          {formatPercent(profitPct)}
        </span>
      </TableCell>
      <TableCell className="py-2.5 text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              disabled={isDeleting}
              data-ocid={`dashboard.history.delete_button.${idx}`}
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="bg-card border-border"
            data-ocid="dashboard.history.dialog"
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-foreground">
                Delete Entry
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Remove the entry for{" "}
                <strong className="text-foreground">
                  {formatDate(entry.date)}
                </strong>
                ? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-secondary text-secondary-foreground hover:bg-accent border-border"
                data-ocid="dashboard.history.cancel_button"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(entry.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="dashboard.history.confirm_button"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export default function Dashboard({ username }: DashboardProps) {
  const { data: stats, isLoading, isError } = useGetDashboardStats();
  const { data: entries, isLoading: entriesLoading } = useGetEntries();
  const addEntry = useAddEntry();
  const deleteEntry = useDeleteEntry();

  const [date, setDate] = useState(getTodayDate());
  const [investAmount, setInvestAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const investNum = Number.parseFloat(investAmount || "0");
  const receivedNum = Number.parseFloat(receivedAmount || "0");
  const hasPreview = investAmount !== "" && receivedAmount !== "";
  const previewProfit = receivedNum - investNum;
  const previewPct = investNum > 0 ? (previewProfit / investNum) * 100 : 0;
  const isPreviewPositive = previewProfit >= 0;

  const recentEntries = entries
    ? [...entries]
        .sort((a, b) => {
          if (b.date < a.date) return -1;
          if (b.date > a.date) return 1;
          return Number(b.createdAt - a.createdAt);
        })
        .slice(0, 20)
    : [];

  const profitSentiment = !stats
    ? "neutral"
    : stats.totalProfit > 0
      ? "profit"
      : stats.totalProfit < 0
        ? "loss"
        : "neutral";
  const pctSentiment = !stats
    ? "neutral"
    : stats.profitPercent > 0
      ? "profit"
      : stats.profitPercent < 0
        ? "loss"
        : "neutral";
  const avgSentiment = !stats
    ? "neutral"
    : stats.avgDailyProfit > 0
      ? "profit"
      : stats.avgDailyProfit < 0
        ? "loss"
        : "neutral";

  const profitIcon = stats && stats.totalProfit < 0 ? TrendingDown : TrendingUp;

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

  async function handleDelete(id: bigint) {
    setDeletingId(id);
    try {
      await deleteEntry.mutateAsync(id);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Failed to delete entry.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Greeting */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-profit">{username}</span>
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s your investment performance at a glance
        </p>
      </div>

      {isError && (
        <Alert
          variant="destructive"
          className="mb-6"
          data-ocid="dashboard.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load statistics. Please refresh.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div
          className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2 mb-8"
          data-ocid="dashboard.loading_state"
        >
          {[1, 2, 3, 4, 5].map((sk) => (
            <div
              key={sk}
              className="rounded-xl border border-border bg-card p-3"
            >
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2 mb-8">
          <StatCard
            label="Total Investment"
            value={stats ? formatCurrency(stats.totalInvested) : "$0.00"}
            icon={DollarSign}
            sentiment="neutral"
            delay={0}
          />
          <StatCard
            label="Total Received"
            value={stats ? formatCurrency(stats.totalReceived) : "$0.00"}
            icon={BarChart2}
            sentiment="neutral"
            delay={60}
          />
          <StatCard
            label="Total Profit"
            value={stats ? formatCurrency(stats.totalProfit) : "$0.00"}
            icon={profitIcon}
            sentiment={profitSentiment}
            delay={120}
          />
          <StatCard
            label="Overall Profit %"
            value={stats ? formatPercent(stats.profitPercent) : "+0.00%"}
            icon={Percent}
            sentiment={pctSentiment}
            delay={180}
          />
          <StatCard
            label="Avg Daily Profit %"
            value={stats ? formatPercent(stats.avgDailyProfit) : "+0.00%"}
            icon={Activity}
            sentiment={avgSentiment}
            delay={240}
          />
        </div>
      )}

      {/* Add Entry + Performance Summary — two-column on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Add Entry inline form — first */}
        <div
          className="rounded-xl border border-border bg-card shadow-card p-6 animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-profit" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-base text-foreground">
                Add Entry
              </h2>
              <p className="text-xs text-muted-foreground">
                Record today's investment
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="dash-entry-date"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Date
                </Label>
                <Input
                  id="dash-entry-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-background border-border text-foreground focus:border-primary/60 h-9 text-sm"
                  data-ocid="dashboard.entry.date.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="dash-invest-amount"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Investment
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="dash-invest-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="pl-6 bg-background border-border text-foreground focus:border-primary/60 h-9 text-sm"
                    data-ocid="dashboard.entry.invest.input"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="dash-received-amount"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Received
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="dash-received-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="pl-6 bg-background border-border text-foreground focus:border-primary/60 h-9 text-sm"
                    data-ocid="dashboard.entry.received.input"
                  />
                </div>
              </div>
            </div>

            {/* Inline profit preview */}
            {hasPreview && (
              <div
                className={`rounded-lg px-4 py-2.5 border text-sm flex items-center justify-between ${
                  isPreviewPositive
                    ? "border-profit/20 bg-profit-muted"
                    : "border-loss/20 bg-loss-muted"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isPreviewPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-profit" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-loss" />
                  )}
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isPreviewPositive ? "text-profit" : "text-loss"
                    }`}
                  >
                    {isPreviewPositive ? "Profit" : "Loss"} Preview
                  </span>
                </div>
                <div>
                  <span
                    className={`font-display font-bold text-sm ${
                      isPreviewPositive ? "text-profit" : "text-loss"
                    }`}
                  >
                    {formatCurrency(previewProfit)}
                  </span>
                  <span
                    className={`text-xs ml-1.5 ${
                      isPreviewPositive ? "text-profit" : "text-loss"
                    }`}
                  >
                    ({formatPercent(previewPct)})
                  </span>
                </div>
              </div>
            )}

            {formError && (
              <Alert
                variant="destructive"
                data-ocid="dashboard.entry.error_state"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {formSuccess && (
              <div
                className="flex items-center gap-2 rounded-lg p-2.5 border border-profit/20 bg-profit-muted text-profit text-xs font-medium"
                data-ocid="dashboard.entry.success_state"
              >
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                Entry recorded successfully!
              </div>
            )}

            <Button
              type="submit"
              disabled={addEntry.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-9 text-sm"
              data-ocid="dashboard.entry.submit_button"
            >
              {addEntry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-3.5 w-3.5" />
                  Add Entry
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Performance Summary — second/last */}
        {!isLoading && stats && (
          <div
            className="rounded-xl border border-border bg-card p-6 animate-fade-in-up"
            style={{ animationDelay: "360ms" }}
          >
            <h2 className="font-display font-semibold text-base text-foreground mb-4">
              Performance Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Net Result
                </span>
                <span
                  className={`text-sm font-semibold ${
                    stats.totalProfit >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {formatCurrency(stats.totalProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Return on Investment
                </span>
                <span
                  className={`text-sm font-semibold ${
                    stats.profitPercent >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {formatPercent(stats.profitPercent)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">
                  Average Daily Return
                </span>
                <span
                  className={`text-sm font-semibold ${
                    stats.avgDailyProfit >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {formatPercent(stats.avgDailyProfit)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Daily History */}
      <div
        className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "420ms" }}
      >
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <HistoryIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-base text-foreground">
              Recent Daily History
            </h2>
            <p className="text-xs text-muted-foreground">Last 20 entries</p>
          </div>
          {recentEntries.length > 0 && (
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {recentEntries.length}
              </span>{" "}
              {recentEntries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {entriesLoading && (
          <div data-ocid="dashboard.loading_state">
            {[1, 2, 3].map((sk) => (
              <div
                key={sk}
                className="flex items-center gap-4 px-6 py-3 border-b border-border"
              >
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        )}

        {!entriesLoading && recentEntries.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-14 text-center"
            data-ocid="dashboard.history.empty_state"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-3">
              <HistoryIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-base text-foreground mb-1">
              No entries yet
            </h3>
            <p className="text-muted-foreground text-xs max-w-xs">
              Add your first entry above to start tracking performance.
            </p>
          </div>
        )}

        {!entriesLoading && recentEntries.length > 0 && (
          <div className="overflow-x-auto">
            <Table data-ocid="dashboard.history.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5">
                    Investment
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5">
                    Received
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5">
                    Profit
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5">
                    Return %
                  </TableHead>
                  <TableHead className="w-10 py-2.5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEntries.map((entry, index) => (
                  <EntryRow
                    key={entry.id.toString()}
                    entry={entry}
                    index={index}
                    onDelete={handleDelete}
                    isDeleting={deletingId === entry.id}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </main>
  );
}
