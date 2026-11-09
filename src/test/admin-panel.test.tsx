import type { ComponentType, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Route as MineRoute } from "@/routes/meus-anuncios";
import { adminApi, type AdminUser } from "@/services/adminApi";
import { authService, type AuthUser } from "@/services/authService";
import { propertyApi } from "@/services/propertyApi";
import type { ApiProperty } from "@/types/api";

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  Link: ({
    to,
    params,
    children,
  }: {
    to: string;
    params?: { id: string };
    children: ReactNode;
  }) => <a href={to.replace("$id", params?.id ?? "")}>{children}</a>,
}));
vi.mock("@/components/layout/PageShell", () => ({
  PageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  PageHeading: ({
    title,
    description,
    actions,
  }: {
    title: string;
    description: string;
    actions: ReactNode;
  }) => (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
      {actions}
    </>
  ),
}));

const master: AuthUser = {
  id: 7,
  fullName: "Master Administrator",
  email: "master@master.com",
  accountType: "OWNER",
  role: "ADMIN",
};
const agency: AdminUser = {
  id: 2,
  fullName: "Agência de teste",
  email: "agency@example.invalid",
  accountType: "AGENCY",
  role: "USER",
  createdAt: "2026-01-01T12:00:00",
  phone: "11999999999",
};
const property: ApiProperty = {
  id: 12,
  title: "Anúncio de outro proprietário",
  description: "Descrição",
  propertyType: "ICE_HOME",
  transactionType: "SALE",
  price: 1234.56,
  bedrooms: 2,
  bathrooms: 1,
  habitableArea: 80,
  capacity: 4,
  colonyName: "Cidade",
  sectorName: "Tharsis",
  complexName: "Complexo",
  unitCode: "A1",
  status: "INACTIVE",
  createdAt: "2026-01-01T12:00:00",
  updatedAt: null,
  ownerName: "Outro anunciante",
  ownerAccountType: "OWNER",
  details: null,
  images: [],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderWithClient(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{children}</QueryClientProvider>);
}

describe("Administrator user panel", () => {
  it("edits a user's contact information and reloads the table", async () => {
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(master);
    const updated = {
      ...agency,
      fullName: "Nome atualizado",
      email: "updated@example.invalid",
      phone: "21987654321",
    };
    vi.spyOn(adminApi, "listUsers").mockResolvedValueOnce([agency]).mockResolvedValue([updated]);
    const update = vi.spyOn(adminApi, "updateUser").mockResolvedValue(updated);
    renderWithClient(<AdminUsersPanel />);
    fireEvent.click(await screen.findByRole("button", { name: `Editar ${agency.fullName}` }));
    const dialog = within(screen.getByRole("dialog", { name: "Editar usuário" }));
    expect(dialog.getByLabelText(/Nome completo/)).toHaveValue(agency.fullName);
    expect(dialog.getByLabelText(/Telefone/)).toHaveValue(agency.phone);
    fireEvent.change(dialog.getByLabelText(/Nome completo/), {
      target: { value: updated.fullName },
    });
    fireEvent.change(dialog.getByLabelText(/E-mail/), { target: { value: updated.email } });
    fireEvent.change(dialog.getByLabelText(/Telefone/), { target: { value: updated.phone } });
    fireEvent.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    expect(await screen.findByText(updated.email)).toBeInTheDocument();
    expect(update).toHaveBeenCalledWith(agency.id, {
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the edit form and entered values when the backend rejects an email", async () => {
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(master);
    vi.spyOn(adminApi, "listUsers").mockResolvedValue([agency]);
    vi.spyOn(adminApi, "updateUser").mockRejectedValue(
      new Error("Este e-mail já está cadastrado para outro usuário."),
    );
    renderWithClient(<AdminUsersPanel />);
    fireEvent.click(await screen.findByRole("button", { name: `Editar ${agency.fullName}` }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.change(dialog.getByLabelText(/E-mail/), {
      target: { value: "taken@example.invalid" },
    });
    fireEvent.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    expect(await dialog.findByRole("alert")).toHaveTextContent("já está cadastrado");
    expect(dialog.getByLabelText(/E-mail/)).toHaveValue("taken@example.invalid");
  });

  it("cancels deletion without changes and deletes only after confirmation", async () => {
    const invalidate = vi.spyOn(QueryClient.prototype, "invalidateQueries");
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(master);
    vi.spyOn(adminApi, "listUsers").mockResolvedValueOnce([agency]).mockResolvedValue([]);
    const remove = vi.spyOn(adminApi, "deleteUser").mockResolvedValue(undefined);
    renderWithClient(<AdminUsersPanel />);
    fireEvent.click(await screen.findByRole("button", { name: `Excluir ${agency.fullName}` }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("todos os seus anúncios");
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: `Excluir ${agency.fullName}` }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(await screen.findByText("Nenhum usuário encontrado.")).toBeInTheDocument();
    expect(remove).toHaveBeenCalledWith(agency.id, expect.anything());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["properties"] });
  });

  it("shows deletion errors without removing the user and disables own-account deletion", async () => {
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(master);
    vi.spyOn(adminApi, "listUsers").mockResolvedValue([
      agency,
      { ...master, phone: "11999999999", createdAt: agency.createdAt },
    ]);
    vi.spyOn(adminApi, "deleteUser").mockRejectedValue(
      new Error("Não foi possível excluir o usuário e seus anúncios."),
    );
    renderWithClient(<AdminUsersPanel />);
    expect(
      await screen.findByRole("button", { name: `Excluir ${master.fullName}` }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: `Excluir ${agency.fullName}` }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível excluir");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(agency.email, { selector: "td" })).toBeInTheDocument();
  });

  it("lists real accounts, searches by email and grants admin only after confirmation", async () => {
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(master);
    vi.spyOn(adminApi, "listUsers")
      .mockResolvedValueOnce([agency])
      .mockResolvedValue([{ ...agency, role: "ADMIN" }]);
    const grant = vi
      .spyOn(adminApi, "grantAdministrator")
      .mockResolvedValue({ ...agency, role: "ADMIN" });
    renderWithClient(<AdminUsersPanel />);
    await screen.findByText(agency.email);
    expect(screen.queryByRole("columnheader", { name: "Tipo de conta" })).not.toBeInTheDocument();
    expect(screen.getByText("Usuário", { selector: "span" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "sem resultados" } });
    expect(screen.getByText("Nenhum usuário encontrado.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: agency.email } });
    fireEvent.click(
      screen.getByRole("button", { name: `Tornar ${agency.fullName} administrador` }),
    );
    expect(grant).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toHaveTextContent("gerenciar todos os anúncios");
    fireEvent.click(screen.getByRole("button", { name: "Confirmar acesso" }));
    await waitFor(() => expect(grant).toHaveBeenCalledWith(2, expect.anything()));
    expect(await screen.findByText("Acesso concedido")).toBeInTheDocument();
  });

  it("does not promote when the confirmation is cancelled", async () => {
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(master);
    vi.spyOn(adminApi, "listUsers").mockResolvedValue([agency]);
    const grant = vi.spyOn(adminApi, "grantAdministrator");
    renderWithClient(<AdminUsersPanel />);
    fireEvent.click(
      await screen.findByRole("button", { name: `Tornar ${agency.fullName} administrador` }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(grant).not.toHaveBeenCalled();
  });

  it("checks server permissions instead of trusting the local admin flag or agency type", async () => {
    vi.spyOn(authService, "getToken").mockReturnValue("test-token");
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(master);
    vi.spyOn(authService, "refreshCurrentUser").mockResolvedValue(agency);
    renderWithClient(
      <ProtectedRoute requireAdmin>
        <p>Conteúdo administrativo</p>
      </ProtectedRoute>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Acesso restrito a administradores.",
    );
    expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
  });

  it("admits an administrator verified by the server", async () => {
    vi.spyOn(authService, "getToken").mockReturnValue("test-token");
    vi.spyOn(authService, "refreshCurrentUser").mockResolvedValue(master);
    renderWithClient(
      <ProtectedRoute requireAdmin>
        <p>Conteúdo administrativo</p>
      </ProtectedRoute>,
    );
    expect(await screen.findByText("Conteúdo administrativo")).toBeInTheDocument();
  });

  it("blocks visitors without fetching administrative content", async () => {
    vi.spyOn(authService, "getToken").mockReturnValue(null);
    const refresh = vi.spyOn(authService, "refreshCurrentUser");
    renderWithClient(
      <ProtectedRoute requireAdmin>
        <p>Conteúdo administrativo</p>
      </ProtectedRoute>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Entre na sua conta");
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe("Administrator listing management", () => {
  it.each<AuthUser>([master, agency, { ...agency, id: 3, accountType: "OWNER" }])(
    "filters listings and restores them when cleared for $role / $accountType",
    async (user) => {
      vi.spyOn(authService, "getCurrentUser").mockReturnValue(user);
      const list = vi.spyOn(propertyApi, "listMine").mockResolvedValue([
        property,
        {
          ...property,
          id: 34,
          title: "Domo Austral",
          ownerName: "Ana",
          colonyName: "Aurora",
          sectorName: "Hellas",
          complexName: "Sul",
          unitCode: "B2",
        },
      ]);
      const Mine = MineRoute.options.component as ComponentType;
      renderWithClient(<Mine />);
      await screen.findByRole("heading", { name: "Domo Austral" });
      const search = screen.getByRole("searchbox", {
        name: "Buscar por título, ID, anunciante ou localização",
      });
      for (const value of [
        "ANUNCIO",
        "#12",
        "outro anunciante",
        "THARSIS",
        "Cidade",
        "Complexo",
        "A1",
        "tharsis outro",
      ]) {
        fireEvent.change(search, { target: { value } });
        expect(screen.getByRole("heading", { name: property.title })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Domo Austral" })).not.toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("1 de 2 anúncios");
      }
      fireEvent.change(search, { target: { value: "inexistente" } });
      expect(screen.getByText("Nenhum anúncio encontrado")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Limpar pesquisa" }));
      expect(search).toHaveValue("");
      expect(screen.getByRole("heading", { name: "Domo Austral" })).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("2 de 2 anúncios");
      expect(list).toHaveBeenCalledTimes(1);
    },
  );

  it("shows other owners and inactive listings, offers editing and confirms deletion", async () => {
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(master);
    vi.spyOn(propertyApi, "listMine").mockResolvedValueOnce([property]).mockResolvedValue([]);
    const remove = vi.spyOn(propertyApi, "remove").mockResolvedValue(undefined);
    const Mine = MineRoute.options.component as ComponentType;
    renderWithClient(<Mine />);
    await screen.findByText(property.title);
    expect(screen.getByText(/Todos os anúncios do sistema/)).toBeInTheDocument();
    expect(screen.getByText("Anunciante: Outro anunciante")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute(
      "href",
      "/anuncios/12/editar",
    );
    expect(screen.getByRole("link", { name: "Gerenciar usuários" })).toHaveAttribute(
      "href",
      "/admin",
    );
    fireEvent.click(screen.getByRole("button", { name: `Excluir ${property.title}` }));
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(await screen.findByText("Nenhum anúncio cadastrado no sistema")).toBeInTheDocument();
    expect(remove).toHaveBeenCalledWith(12, expect.anything());
  });

  it("keeps the user-management action hidden for ordinary agencies", async () => {
    vi.spyOn(authService, "getCurrentUser").mockReturnValue(agency);
    vi.spyOn(propertyApi, "listMine").mockResolvedValue([]);
    const Mine = MineRoute.options.component as ComponentType;
    renderWithClient(<Mine />);
    await screen.findByText("Você ainda não tem imóveis cadastrados");
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Gerenciar usuários" })).not.toBeInTheDocument();
  });
});
