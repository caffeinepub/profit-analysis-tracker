import { Button } from "@/components/ui/button";
import {
  BarChart2,
  CalendarDays,
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  username: string;
}

const navLinks: {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "add-entry", label: "Add Entry", icon: PlusCircle },
  { id: "daily-history", label: "Daily History", icon: History },
  { id: "monthly-history", label: "Monthly History", icon: CalendarDays },
];

export default function NavBar({
  currentPage,
  onNavigate,
  username,
}: NavBarProps) {
  const { clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

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

          {/* Desktop Nav Links */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onNavigate(link.id)}
                  data-ocid={`nav.${link.id}.link`}
                  className={`
                    relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "text-profit bg-profit/10 border border-profit/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-profit" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User info + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center">
                <span className="text-xs font-bold text-profit">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                {username}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clear}
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sign out"
              data-ocid="nav.logout.button"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-ocid="nav.mobile.toggle"
            >
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <nav className="flex flex-col p-3 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-profit bg-profit/10 border border-profit/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
