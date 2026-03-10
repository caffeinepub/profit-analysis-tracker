import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddEntry } from "../hooks/useQueries";

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

export default function AddEntry() {
  const addEntry = useAddEntry();
  const [date, setDate] = useState(getTodayDate());
  const [investAmount, setInvestAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const investNum = Number.parseFloat(investAmount || "0");
  const receivedNum = Number.parseFloat(receivedAmount || "0");
  const hasPreview = investAmount !== "" && receivedAmount !== "";
  const previewProfit = receivedNum - investNum;
  const previewPct = investNum > 0 ? (previewProfit / investNum) * 100 : 0;
  const isPreviewPositive = previewProfit >= 0;

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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Add Daily Entry
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Record your investment and returns for the day
        </p>
      </div>

      <div
        className="max-w-lg animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="rounded-xl border border-border bg-card shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-profit" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-base text-foreground">
                New Entry
              </h2>
              <p className="text-xs text-muted-foreground">
                Fill in the details below
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
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
                className="bg-input/50 border-border focus:border-primary/60 h-10"
                data-ocid="entry.date.input"
              />
            </div>

            <div className="space-y-2">
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
                  className="pl-7 bg-input/50 border-border focus:border-primary/60 h-10"
                  data-ocid="entry.invest.input"
                />
              </div>
            </div>

            <div className="space-y-2">
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
                  className="pl-7 bg-input/50 border-border focus:border-primary/60 h-10"
                  data-ocid="entry.received.input"
                />
              </div>
            </div>

            {/* Inline profit preview */}
            {hasPreview && (
              <div
                className={`rounded-lg p-4 border text-sm ${
                  isPreviewPositive
                    ? "border-profit/20 bg-profit-muted"
                    : "border-loss/20 bg-loss-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPreviewPositive ? (
                      <TrendingUp className="w-4 h-4 text-profit" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-loss" />
                    )}
                    <span
                      className={`font-medium text-xs uppercase tracking-wider ${
                        isPreviewPositive ? "text-profit" : "text-loss"
                      }`}
                    >
                      Projected {isPreviewPositive ? "Profit" : "Loss"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-display font-bold text-base ${
                        isPreviewPositive ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatCurrency(previewProfit)}
                    </span>
                    <span
                      className={`text-xs ml-2 ${
                        isPreviewPositive ? "text-profit" : "text-loss"
                      }`}
                    >
                      ({formatPercent(previewPct)})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {formError && (
              <Alert variant="destructive" data-ocid="entry.error_state">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {formSuccess && (
              <div
                className="flex items-center gap-2 rounded-lg p-3 border border-profit/20 bg-profit-muted text-profit text-sm font-medium"
                data-ocid="entry.success_state"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Entry recorded successfully!
              </div>
            )}

            <Button
              type="submit"
              disabled={addEntry.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10"
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
