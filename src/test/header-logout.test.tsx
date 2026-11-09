import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { authService, type AuthUser } from "@/services/authService";

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("Logout navigation", () => {
  it.each(["desktop", "mobile"])(
    "returns from the admin panel to home when signing out on %s",
    async (layout) => {
      const user: AuthUser = {
        id: 7,
        fullName: "Master Administrator",
        email: "master@master.com",
        accountType: "OWNER",
        role: "ADMIN",
      };
      window.sessionStorage.setItem(
        "mars-auth-session",
        JSON.stringify({ user, token: "test-token" }),
      );
      vi.spyOn(authService, "refreshCurrentUser").mockResolvedValue(user);
      const root = createRootRoute({ component: Outlet });
      const home = createRoute({
        getParentRoute: () => root,
        path: "/",
        component: () => <h1>Página inicial</h1>,
      });
      const admin = createRoute({
        getParentRoute: () => root,
        path: "/admin",
        component: () => (
          <ProtectedRoute requireAdmin>
            <Header />
            <h1>Painel administrativo</h1>
          </ProtectedRoute>
        ),
      });
      const router = createRouter({
        routeTree: root.addChildren([home, admin]),
        history: createMemoryHistory({ initialEntries: ["/admin"] }),
        defaultPendingMinMs: 0,
      });
      render(
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <RouterProvider router={router} />
        </QueryClientProvider>,
      );
      await screen.findByRole("heading", { name: "Painel administrativo" });
      if (layout === "mobile") {
        fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
        fireEvent.click(
          within(screen.getByRole("navigation", { name: "Menu móvel" })).getByRole("button", {
            name: "Sair",
          }),
        );
      } else fireEvent.click(screen.getByRole("button", { name: "Sair" }));
      expect(await screen.findByRole("heading", { name: "Página inicial" })).toBeInTheDocument();
      await waitFor(() => expect(router.state.location.pathname).toBe("/"));
      expect(authService.getCurrentUser()).toBeNull();
      expect(authService.getToken()).toBeNull();
      expect(
        screen.queryByText("Entre na sua conta para acessar esta área."),
      ).not.toBeInTheDocument();
    },
  );
});
