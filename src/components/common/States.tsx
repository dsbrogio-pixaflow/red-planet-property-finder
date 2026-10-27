import type { ReactNode } from "react";
import { AlertTriangle, Loader2, Telescope } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <Telescope className="size-10 text-primary" aria-hidden />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" aria-hidden /> {label}
    </div>
  );
}

export function ErrorState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
