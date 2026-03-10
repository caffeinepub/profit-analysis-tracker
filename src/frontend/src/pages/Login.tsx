import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  CalendarDays,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginProps {
  defaultTab?: "signin" | "register";
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}profittrack_salt_2024`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Login({ defaultTab = "signin" }: LoginProps) {
  const { login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();

  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  function switchToRegister(email?: string) {
    if (email) setRegEmail(email);
    setActiveTab("register");
  }

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setSignInLoading(true);
    try {
      await login();
      if (!actor) {
        toast.error("Unable to connect. Please try again.");
        return;
      }
      const hash = await hashPassword(signInPassword);
      const verified = await actor.verifyEmailPassword(signInEmail, hash);
      if (!verified) {
        toast.error("Invalid email or password");
      }
    } catch (err: any) {
      if (
        err?.message?.includes("no profile") ||
        err?.message?.includes("not found")
      ) {
        toast.error("No account found. Please register first.");
        switchToRegister(signInEmail);
      } else {
        toast.error("Sign in failed. Please try again.");
      }
    } finally {
      setSignInLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regConfirm) {
      toast.error("Please fill in all fields");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setRegLoading(true);
    try {
      await login();
      if (!actor) {
        toast.error("Unable to connect. Please try again.");
        return;
      }
      const hash = await hashPassword(regPassword);
      await actor.registerUserWithEmailPassword(regUsername, regEmail, hash);
      toast.success("Account created! Welcome to ProfitTrack.");
    } catch (err: any) {
      if (err?.message?.includes("taken") || err?.message?.includes("exists")) {
        toast.error("Username or email already in use");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setRegLoading(false);
    }
  }

  const isLoading = isLoggingIn || signInLoading || regLoading;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.72 0.18 168 / 0.07) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 85% 85%, oklch(0.65 0.20 240 / 0.05) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 glow-profit">
            <TrendingUp className="w-7 h-7 text-profit" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            ProfitTrack
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Professional profit analysis &amp; investment tracker
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full rounded-none border-b border-border bg-card h-12 p-0 gap-0">
              <TabsTrigger
                value="signin"
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-semibold text-sm transition-colors"
                data-ocid="login.tab"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-semibold text-sm transition-colors"
                data-ocid="register.tab"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin" className="p-7 pt-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email address
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                    data-ocid="login.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signin-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showSignInPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary pr-11"
                      data-ocid="login.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showSignInPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showSignInPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm transition-all"
                  data-ocid="login.primary_button"
                >
                  {isLoading && activeTab === "signin" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchToRegister()}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Register
                  </button>
                </p>
              </form>
            </TabsContent>

            {/* Create Account */}
            <TabsContent value="register" className="p-7 pt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="reg-username"
                    className="text-sm font-medium text-foreground"
                  >
                    Username
                  </Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="Your display name"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                    data-ocid="register.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reg-email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email address
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                    data-ocid="register.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reg-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Create password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary pr-11"
                      data-ocid="register.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showRegPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reg-confirm"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-confirm"
                      type={showRegConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary pr-11"
                      data-ocid="register.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showRegConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showRegConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {regPassword && regConfirm && regPassword !== regConfirm && (
                    <p
                      className="text-xs text-destructive mt-1"
                      data-ocid="register.error_state"
                    >
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm transition-all mt-1"
                  data-ocid="register.primary_button"
                >
                  {isLoading && activeTab === "register" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Feature strip */}
        <div className="mt-7 grid grid-cols-3 gap-3">
          {[
            {
              icon: CalendarDays,
              label: "Daily Tracking",
              desc: "Log investments daily",
            },
            {
              icon: BarChart3,
              label: "Monthly Reports",
              desc: "Auto-grouped summaries",
            },
            {
              icon: TrendingUp,
              label: "Profit Analysis",
              desc: "Real-time analytics",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card/50 p-3 text-center"
            >
              <Icon className="w-4 h-4 text-profit mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-profit hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
