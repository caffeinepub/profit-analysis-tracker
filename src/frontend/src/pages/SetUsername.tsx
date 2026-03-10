import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, User } from "lucide-react";
import { useState } from "react";
import { useRegisterUser } from "../hooks/useQueries";

export default function SetUsername() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const registerUser = useRegisterUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a display name.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 32) {
      setError("Display name must be 32 characters or fewer.");
      return;
    }
    try {
      await registerUser.mutateAsync(trimmed);
    } catch {
      setError("Failed to save username. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.72 0.18 168 / 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 shadow-card">
            <User className="w-7 h-7 text-profit" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome!
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Set a display name to personalize your dashboard
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Display Name
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g. John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={32}
                className="bg-input/50 border-border focus:border-primary/60 h-11"
                data-ocid="username.input"
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive" data-ocid="username.error_state">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={registerUser.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11"
              data-ocid="username.submit_button"
            >
              {registerUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
