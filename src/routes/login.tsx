import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Particles } from "@/components/Particles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetToDemo } from "@/lib/synapse-store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("aryan@synapse.app");
  const [password, setPassword] = useState("synapse2025");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    resetToDemo();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app px-6">
      <Particles count={20} />
      <form onSubmit={submit} className="card-glass relative z-10 w-full max-w-md rounded-3xl p-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff2d7e]">Welcome back</div>
        <h1 className="text-4xl font-bold">LOG <span className="text-gradient">IN</span></h1>
        <div className="mt-8 space-y-3">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="h-14 rounded-2xl border-white/10 bg-white/5 px-5 text-base" />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="h-14 rounded-2xl border-white/10 bg-white/5 px-5 text-base" />
        </div>
        <Button type="submit" className="btn-primary-grad mt-6 h-14 w-full rounded-2xl text-base font-semibold text-white">
          Log in
        </Button>
        <Link to="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">
          New here? <span className="text-[#ff2d7e]">Start onboarding</span>
        </Link>
      </form>
    </div>
  );
}
