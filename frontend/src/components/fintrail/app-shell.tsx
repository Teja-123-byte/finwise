import { Link } from "@tanstack/react-router";
import { Moon, Sun, PiggyBank, LayoutDashboard, ReceiptText, Target, Users, LogOut } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useFinance } from "@/components/fintrail/finance-provider";
import { useFinanceStore } from "@/stores/finance-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ReceiptText },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/split", label: "Split", icon: Users },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { user } = useFinance();
  const theme = useFinanceStore((state) => state.theme);
  const setTheme = useFinanceStore((state) => state.setTheme);
  const isAuthenticated = useFinanceStore((state) => state.isAuthenticated);
  const logout = useFinanceStore((state) => state.logout);

  useEffect(() => {
    if (!isAuthenticated) window.location.replace("/");
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PiggyBank className="size-4" />
            </span>
            <span className="display text-base font-bold tracking-tight text-foreground">
              Fintrail
            </span>
          </Link>

          <nav className="scroll-x order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "bg-muted text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex max-w-[13rem] items-center gap-2 rounded-full border border-input bg-muted/70 px-3 py-2 text-xs text-foreground sm:max-w-none sm:text-sm">
              <span className="font-semibold">{user.name || "Your profile"}</span>
              {user.email ? <span className="text-muted-foreground">{user.email}</span> : null}
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle colour theme"
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </main>

    </div>
  );
}

export function Panel({
  title,
  hint,
  className,
  children,
  action,
}: {
  title: string;
  hint?: string;
  className?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={cn("surface-raised p-4 sm:p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
