import type { ReactNode } from "react";
import { authService } from "@/services/authService";
import { ErrorState } from "@/components/common/States";

/**
 * Preparado para futura autenticação. Em modo demonstrativo, sempre libera.
 * A verificação real de permissões acontecerá no servidor e nas políticas do banco.
 */
export function ProtectedRoute({
  requireAdmin,
  children,
}: {
  requireAdmin?: boolean;
  children: ReactNode;
}) {
  if (requireAdmin && !authService.canAccessAdmin()) {
    return <ErrorState title="Acesso restrito a administradores." />;
  }
  return <>{children}</>;
}
