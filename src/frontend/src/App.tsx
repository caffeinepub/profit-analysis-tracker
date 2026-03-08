import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

type Page = "dashboard" | "history";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

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

      <NavBar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Page content with top padding for fixed nav */}
      <div className="pt-16">
        {currentPage === "dashboard" ? <Dashboard /> : <History />}
      </div>

      {/* Footer */}
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
