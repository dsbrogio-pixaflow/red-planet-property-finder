import type { ComponentType, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Route } from "@/routes/anuncios.novo";
import { authService, type AuthUser } from "@/services/authService";

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => vi.fn(),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock("@/components/layout/PageShell", () => ({
  PageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  PageHeading: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderPage() {
  const NewListing = Route.options.component as ComponentType;
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <NewListing />
    </QueryClientProvider>,
  );
}

describe("New listing page", () => {
  it.each<AuthUser["accountType"]>(["OWNER", "AGENCY"])(
    "renders the listing form for an authenticated %s without crashing",
    async (accountType) => {
      vi.spyOn(authService, "getCurrentUser").mockReturnValue({
        id: 1,
        fullName: "Usuário de teste",
        email: "teste@example.com",
        accountType,
        role: "USER",
      });

      renderPage();

      expect(await screen.findByRole("heading", { name: "Novo imóvel" })).toBeInTheDocument();
      expect(screen.getByLabelText(/Título do anúncio/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Publicar imóvel/ })).toBeInTheDocument();
    },
  );

  it("shows the login action when there is no authenticated user", async () => {
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(null);

    renderPage();

    expect(await screen.findByRole("heading", { name: "Entre na sua conta" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
  });
});
