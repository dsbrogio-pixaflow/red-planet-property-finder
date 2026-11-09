import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { ErrorState } from "@/components/common/States";

export function ProtectedRoute({
  requireAdmin,
  children,
}: {
  requireAdmin?: boolean;
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      setToken(authService.getToken());
      setReady(true);
    };
    sync();
    return authService.subscribe(sync);
  }, []);
  const session = useQuery({
    queryKey: ["auth", "me", token],
    queryFn: authService.refreshCurrentUser,
    enabled: ready && !!token,
    staleTime: 0,
    retry: false,
  });
  if (!ready || (token && session.isPending))
    return <p className="p-8 text-center">Verificando permissões...</p>;
  if (session.isError)
    return (
      <div className="p-8 text-center">
        <ErrorState title={session.error.message} />
        <button onClick={() => void session.refetch()} className="mt-4 underline">
          Tentar novamente
        </button>
      </div>
    );
  if (!token || !session.data) {
    return <ErrorState title="Entre na sua conta para acessar esta área." />;
  }
  if (requireAdmin && session.data.role !== "ADMIN") {
    return <ErrorState title="Acesso restrito a administradores." />;
  }
  return <>{children}</>;
}
