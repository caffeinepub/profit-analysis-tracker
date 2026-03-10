import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import NavBar from "./components/NavBar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetUserProfile } from "./hooks/useQueries";
import AddEntry from "./pages/AddEntry";
import DailyHistory from "./pages/DailyHistory";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MonthlyHistory from "./pages/MonthlyHistory";

export type Page =
  | "dashboard"
  | "add-entry"
  | "daily-history"
  | "monthly-history";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  // Loading: II initializing or actor loading
  if (isInitializing || (identity && actorFetching)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-profit animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!identity) {
    return (
      <>
        <Login />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Profile loading
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-profit animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  // No profile — open register tab
  if (!userProfile) {
    return (
      <>
        <Login defaultTab="register" />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Main app
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background ambient gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 70% 10%, oklch(0.72 0.18 168 / 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 10% 80%, oklch(0.65 0.20 240 / 0.04) 0%, transparent 60%)
          `,
        }}
      />

      <NavBar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        username={userProfile.username}
      />

      <div className="pt-16">
        {currentPage === "dashboard" && (
          <Dashboard username={userProfile.username} />
        )}
        {currentPage === "add-entry" && <AddEntry />}
        {currentPage === "daily-history" && <DailyHistory />}
        {currentPage === "monthly-history" && <MonthlyHistory />}
      </div>

      <footer className="border-t border-border mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-loss" aria-label="love">
              ♥
            </span>{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-profit hover:underline underline-offset-2 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
