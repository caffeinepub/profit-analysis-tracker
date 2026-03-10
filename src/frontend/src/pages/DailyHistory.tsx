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
  AlertCircle,
  History as HistoryIcon,
  Loader2,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Entry } from "../backend.d";
import { useDeleteEntry, useGetEntries } from "../hooks/useQueries";

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
      data-ocid={`history.row.${idx}`}
    >
      <TableCell className="font-medium text-foreground text-sm py-3">
        {formatDate(entry.date)}
      </TableCell>
      <TableCell className="text-sm text-foreground/80 py-3">
        {formatCurrency(entry.investAmount)}
      </TableCell>
      <TableCell className="text-sm text-foreground/80 py-3">
        {formatCurrency(entry.receivedAmount)}
      </TableCell>
      <TableCell className="py-3">
        <div
          className={`flex items-center gap-1.5 font-semibold text-sm ${isPositive ? "text-profit" : "text-loss"}`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {formatCurrency(profit)}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isPositive
              ? "bg-profit-muted text-profit border border-profit/20"
              : "bg-loss-muted text-loss border border-loss/20"
          }`}
        >
          {formatPercent(profitPct)}
        </span>
      </TableCell>
      <TableCell className="py-3 text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              disabled={isDeleting}
              data-ocid={`history.delete_button.${idx}`}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="bg-card border-border"
            data-ocid="history.dialog"
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
                data-ocid="history.cancel_button"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(entry.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="history.confirm_button"
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

export default function DailyHistory() {
  const { data: entries, isLoading, isError } = useGetEntries();
  const deleteEntry = useDeleteEntry();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const sortedEntries = entries
    ? [...entries].sort((a, b) => {
        if (b.date < a.date) return -1;
        if (b.date > a.date) return 1;
        return Number(b.createdAt - a.createdAt);
      })
    : [];

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
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Daily History
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          All recorded investment entries sorted by date
        </p>
      </div>

      {isError && (
        <Alert
          variant="destructive"
          className="mb-6"
          data-ocid="history.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load entries. Please refresh the page.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div
          className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
          data-ocid="history.loading_state"
        >
          {[1, 2, 3, 4, 5].map((sk) => (
            <div
              key={sk}
              className="flex items-center gap-4 p-4 border-b border-border"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-fade-in-up">
          {sortedEntries.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="history.empty_state"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <HistoryIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                No entries yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Head to Add Entry to record your first investment and start
                tracking performance.
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {sortedEntries.length}
                  </span>{" "}
                  {sortedEntries.length === 1 ? "entry" : "entries"} recorded
                </span>
              </div>
              <div className="overflow-x-auto">
                <Table data-ocid="history.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
                        Investment
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
                        Received
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
                        Profit
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
                        Return %
                      </TableHead>
                      <TableHead className="w-12 py-3" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEntries.map((entry, index) => (
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
            </>
          )}
        </div>
      )}
    </main>
  );
}
