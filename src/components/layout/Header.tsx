import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { authService } from "@/services/authService";

const NAV = [
  { to: "/terrenos", label: "Comprar" },
  { to: "/descobrir", label: "Descobrir" },
  { to: "/financiamento", label: "Financiamento" },
  { to: "/ajuda", label: "Ajuda" },
] as const;

const linkClass = "text-sm text-muted-foreground transition-colors hover:text-foreground";

export function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => authService.getCurrentUser());
  useEffect(() => {
    const unsubscribe = authService.subscribe(() => setUser(authService.getCurrentUser()));
    if (authService.getToken()) void authService.refreshCurrentUser().catch(() => {});
    return unsubscribe;
  }, []);

  function logout() {
    authService.logout();
    setOpen(false);
    void navigate({ to: "/", replace: true });
  }
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Principal">
          <Link
            to="/terrenos"
            className={linkClass}
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Comprar
          </Link>
          <Link
            to="/descobrir"
            className={linkClass}
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Descobrir
          </Link>
          <Link
            to="/anuncios/novo"
            className={linkClass}
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Anunciar
          </Link>
          <Link
            to="/financiamento"
            className={linkClass}
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Financiamento
          </Link>
          <Link
            to="/ajuda"
            className={linkClass}
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Ajuda
          </Link>
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Button asChild variant="glass" size="sm">
                  <Link to="/admin">Painel de Administração</Link>
                </Button>
              )}
              <Button asChild variant="glass" size="sm">
                <Link to="/meus-anuncios">
                  <User /> {user.fullName}
                </Link>
              </Button>
              <Button variant="hero" size="sm" onClick={logout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="glass" size="sm">
                <Link to="/login">
                  <User /> Entrar
                </Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/cadastro">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="border-t border-border/60 px-4 pb-4 lg:hidden" aria-label="Menu móvel">
          <ul className="flex flex-col gap-1 pt-3">
            {user?.role === "ADMIN" && (
              <li>
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
                >
                  Painel de Administração
                </Link>
              </li>
            )}
            {NAV.slice(0, 2).map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/anuncios/novo"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
              >
                Anunciar
              </Link>
            </li>
            {NAV.slice(2).map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/meus-anuncios"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
              >
                Meus anúncios
              </Link>
            </li>
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
            {user ? (
              <>
                <Button asChild variant="glass" onClick={() => setOpen(false)}>
                  <Link to="/meus-anuncios">
                    <User /> {user.fullName}
                  </Link>
                </Button>
                <Button variant="hero" onClick={logout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="glass" onClick={() => setOpen(false)}>
                  <Link to="/login">
                    <User /> Entrar
                  </Link>
                </Button>
                <Button asChild variant="hero" onClick={() => setOpen(false)}>
                  <Link to="/cadastro">Criar conta</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
