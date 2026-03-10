import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  icon: LucideIcon;
  sentiment?: "neutral" | "profit" | "loss";
  isLoading?: boolean;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  subLabel,
  icon: Icon,
  sentiment = "neutral",
  isLoading = false,
  delay = 0,
}: StatCardProps) {
  const sentimentStyles = {
    neutral: {
      card: "border-border",
      icon: "bg-accent text-muted-foreground",
      value: "text-foreground",
      glow: "",
    },
    profit: {
      card: "border-profit/20 glow-profit",
      icon: "bg-profit-muted text-profit",
      value: "text-profit",
      glow: "glow-profit",
    },
    loss: {
      card: "border-loss/20 glow-loss",
      icon: "bg-loss-muted text-loss",
      value: "text-loss",
      glow: "glow-loss",
    },
  };

  const styles = sentimentStyles[sentiment];

  return (
    <div
      className={`
        relative rounded-xl border bg-card p-3 shadow-card
        transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5
        ${styles.card} ${styles.glow}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay */}
      {sentiment !== "neutral" && (
        <div
          className={`absolute inset-0 rounded-xl opacity-5 pointer-events-none ${
            sentiment === "profit"
              ? "bg-gradient-to-br from-profit to-transparent"
              : "bg-gradient-to-br from-loss to-transparent"
          }`}
        />
      )}

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-20 mb-1" />
          ) : (
            <p
              className={`text-base font-display font-bold tracking-tight animate-number-reveal ${styles.value}`}
              style={{ animationDelay: `${delay + 100}ms` }}
            >
              {value}
            </p>
          )}
          {subLabel && !isLoading && (
            <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>
          )}
        </div>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${styles.icon}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
