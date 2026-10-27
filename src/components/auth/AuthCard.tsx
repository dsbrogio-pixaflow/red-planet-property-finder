import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import heroImg from "@/assets/hero-mars.jpg";
import { DEMO_NOTICE } from "@/services/authService";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="Horizonte marciano ao anoitecer" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-horizon" />
        <p className="absolute bottom-10 left-10 max-w-sm font-display text-2xl">
          Seu próximo destino está entre as estrelas.
        </p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <h1 className="mt-10 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <p role="note" className="mt-4 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
            Modo demonstrativo — nenhuma conta real é criada ou acessada.
          </p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function GoogleButton({ label }: { label: string }) {
  return (
    <Button type="button" variant="glass" className="w-full" onClick={() => toast.info(DEMO_NOTICE)}>
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.06-.15-1.11z" />
      </svg>
      {label}
    </Button>
  );
}
