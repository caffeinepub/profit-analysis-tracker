import { TrendingUp } from "lucide-react";

interface NavBarProps {
  currentPage: "dashboard" | "history";
  onNavigate: (page: "dashboard" | "history") => void;
}

export default function NavBar({ currentPage, onNavigate }: NavBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 nav-glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/30">
              <TrendingUp className="w-4 h-4 text-profit" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              ProfitTrack
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            <button
              type="button"
              data-ocid="nav.dashboard.link"
              onClick={() => onNavigate("dashboard")}
              className={`
                relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${
                  currentPage === "dashboard"
                    ? "text-profit bg-profit/10 border border-profit/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }
              `}
            >
              Dashboard
              {currentPage === "dashboard" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-profit" />
              )}
            </button>
            <button
              type="button"
              data-ocid="nav.history.link"
              onClick={() => onNavigate("history")}
              className={`
                relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${
                  currentPage === "history"
                    ? "text-profit bg-profit/10 border border-profit/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }
              `}
            >
              History
              {currentPage === "history" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-profit" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
