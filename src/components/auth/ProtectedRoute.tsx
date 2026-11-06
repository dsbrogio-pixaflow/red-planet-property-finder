import type { ReactNode } from "react";
import { authService } from "@/services/authService";
import { ErrorState } from "@/components/common/States";

export function ProtectedRoute({
  requireAdmin,
  children,
}: {
  requireAdmin?: boolean;
  children: ReactNode;
}) {
  if (!authService.getCurrentUser()) {
    return <ErrorState title="Entre na sua conta para acessar esta área." />;
  }
  if (requireAdmin && !authService.canAccessAdmin()) {
    return <ErrorState title="Acesso restrito a administradores." />;
  }
  return <>{children}</>;
}
