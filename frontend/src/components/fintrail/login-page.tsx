import { ArrowRight, Eye, Lock, PiggyBank, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFinanceStore } from "@/stores/finance-store";

interface LoginPageProps {
  onSuccess?: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps = {}) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useFinanceStore((state) => state.login);
  const register = useFinanceStore((state) => state.register);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (mode === "register") {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onSuccess?.();
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign you in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(240,249,255,0.9))] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.95))] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[28px] border border-border/70 bg-background/85 shadow-2xl shadow-black/10 backdrop-blur-xl lg:flex-row">
        <div className="flex flex-1 flex-col justify-between bg-muted/30 p-8 sm:p-10 lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <PiggyBank className="size-4" /> Fintrail
            </div>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Start your personal money dashboard.</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">Track daily spending, plan savings goals, and stay in control of your budget in one place.</p>
          </div>
          <div className="mt-10 space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground"><ShieldCheck className="size-4 text-primary" /> Secure and private experience</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Eye className="size-4" /> Start with a clean workspace.</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="size-4" /> Your details stay local in this app.</div>
          </div>
        </div>
        <div className="flex w-full max-w-xl items-center justify-center p-6 sm:p-8 lg:p-10">
          <Card className="w-full border-border/70 bg-background/95 shadow-none">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl">{mode === "register" ? "Create account" : "Welcome back"}</CardTitle>
              <CardDescription>{mode === "register" ? "Start with a brand-new workspace and build your budget from scratch." : "Sign in to access your saved transactions."}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex rounded-xl border border-input bg-muted/40 p-1">
                <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Create account</button>
                <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Sign in</button>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === "register" ? <div className="space-y-2"><label className="text-sm font-medium text-foreground" htmlFor="name">Name</label><Input id="name" type="text" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required /></div> : null}
                <div className="space-y-2"><label className="text-sm font-medium text-foreground" htmlFor="email">Email</label><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-foreground" htmlFor="password">Password</label><Input id="password" type="password" placeholder=" Enter yourpassword" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></div>
                <Button type="submit" className="w-full">{mode === "register" ? "Create fresh workspace" : "Sign in"} <ArrowRight className="size-4" /></Button>
              </form>
              <div className="mt-5 rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">{mode === "register" ? "New accounts begin empty so you can add your own transactions and goals from day one." : "Your transactions are loaded securely from your account."}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
