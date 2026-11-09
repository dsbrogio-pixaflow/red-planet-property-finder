import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageHeading } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormField } from "@/components/common/FormField";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { adminApi, type AdminUser, type AdminUserUpdate } from "@/services/adminApi";
import { authService } from "@/services/authService";

export function AdminUsersPanel() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const client = useQueryClient();
  const user = authService.getCurrentUser();
  const queryKey = ["admin", "users", user?.id];
  const users = useQuery({ queryKey, queryFn: adminApi.listUsers });
  const grant = useMutation({
    mutationFn: adminApi.grantAdministrator,
    onSuccess: async () => {
      setSelected(null);
      await client.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Usuário adicionado ao perfil de administrador.");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Não foi possível atualizar a permissão."),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUserUpdate }) =>
      adminApi.updateUser(id, data),
    onSuccess: async () => {
      setEditing(null);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin", "users"] }),
        client.invalidateQueries({ queryKey: ["properties"] }),
        client.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);
      toast.success("Usuário atualizado com sucesso.");
    },
  });
  const remove = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: async () => {
      setDeleting(null);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin", "users"] }),
        client.invalidateQueries({ queryKey: ["properties"] }),
      ]);
      toast.success("Usuário e anúncios vinculados excluídos com sucesso.");
    },
  });
  const mutating = grant.isPending || update.isPending || remove.isPending;
  const list = (users.data ?? []).filter((item) =>
    `${item.fullName} ${item.email}`
      .toLocaleLowerCase("pt-BR")
      .includes(search.trim().toLocaleLowerCase("pt-BR")),
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
        <PageHeading
          eyebrow="Administração"
          title="Painel de usuários"
          description="Consulte, edite e exclua usuários ou conceda acesso administrativo."
          actions={
            <Button asChild variant="hero">
              <Link to="/meus-anuncios">Gerenciar todos os anúncios</Link>
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <Users className="mb-2 size-5 text-primary" aria-hidden />
            <p className="text-sm text-muted-foreground">Usuários cadastrados</p>
            <p className="text-3xl font-semibold">{users.data?.length ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <ShieldCheck className="mb-2 size-5 text-primary" aria-hidden />
            <p className="text-sm text-muted-foreground">Administradores</p>
            <p className="text-3xl font-semibold">
              {users.data?.filter((item) => item.role === "ADMIN").length ?? "—"}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-users-search" className="text-sm font-medium">
            Buscar usuário por nome ou e-mail
          </label>
          <Input
            id="admin-users-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Digite um nome ou e-mail"
          />
        </div>
        {users.isPending && <p role="status">Carregando usuários...</p>}
        {users.isError && (
          <div role="alert" className="space-y-3 rounded-xl border p-5">
            <p>{users.error.message}</p>
            <Button variant="outline" onClick={() => void users.refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}
        {users.isSuccess && (
          <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Usuários cadastrados e permissões administrativas
              </caption>
              <thead className="border-b bg-secondary/40">
                <tr>
                  {["Nome", "E-mail", "Perfil", "Ação"].map((label) => (
                    <th key={label} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-4 font-medium">{item.fullName}</td>
                    <td className="px-4 py-4">{item.email}</td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          item.role === "ADMIN" ? "text-primary-glow" : "text-muted-foreground"
                        }
                      >
                        {item.role === "ADMIN" ? "Administrador" : "Usuário"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={mutating}
                          onClick={() => {
                            update.reset();
                            setEditing(item);
                          }}
                          aria-label={`Editar ${item.fullName}`}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={mutating || item.id === user?.id}
                          title={
                            item.id === user?.id
                              ? "Não é possível excluir sua própria conta."
                              : undefined
                          }
                          onClick={() => {
                            remove.reset();
                            setDeleting(item);
                          }}
                          aria-label={`Excluir ${item.fullName}`}
                        >
                          Excluir
                        </Button>
                        {item.role === "ADMIN" ? (
                          <span className="text-xs text-muted-foreground">Acesso concedido</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelected(item)}
                            disabled={mutating}
                            aria-label={`Tornar ${item.fullName} administrador`}
                          >
                            Tornar administrador
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Administradores podem editar e excluir anúncios de qualquer usuário e conceder acesso
          administrativo a outras contas.
        </p>
      </div>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !update.isPending) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            <DialogDescription>Atualize o nome, e-mail e telefone desta conta.</DialogDescription>
          </DialogHeader>
          {editing && (
            <AdminUserEditor
              key={editing.id}
              initial={editing}
              saving={update.isPending}
              error={update.error?.message}
              onCancel={() => setEditing(null)}
              onSave={(data) => update.mutate({ id: editing.id, data })}
            />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              A conta de {deleting?.fullName} ({deleting?.email}) e todos os seus anúncios,
              incluindo imagens e informações adicionais, serão excluídos permanentemente. Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.isError && (
            <p role="alert" className="text-sm text-destructive">
              {remove.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deleting) remove.mutate(deleting.id);
              }}
            >
              {remove.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !grant.isPending) setSelected(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conceder acesso de administrador?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected?.fullName} ({selected?.email}) poderá gerenciar todos os anúncios e
              adicionar outros administradores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={grant.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={grant.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (selected) grant.mutate(selected.id);
              }}
            >
              {grant.isPending ? "Salvando..." : "Confirmar acesso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

function AdminUserEditor({
  initial,
  saving,
  error,
  onCancel,
  onSave,
}: {
  initial: AdminUser;
  saving: boolean;
  error: string | undefined;
  onCancel: () => void;
  onSave: (data: AdminUserUpdate) => void;
}) {
  const [data, setData] = useState<AdminUserUpdate>({
    fullName: initial.fullName,
    email: initial.email,
    phone: initial.phone ?? "",
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ fullName: data.fullName.trim(), email: data.email.trim(), phone: data.phone.trim() });
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={saving} className="space-y-4">
        <FormField id="admin-edit-name" label="Nome completo" required>
          <Input
            id="admin-edit-name"
            value={data.fullName}
            maxLength={150}
            required
            onChange={(event) => setData({ ...data, fullName: event.target.value })}
          />
        </FormField>
        <FormField id="admin-edit-email" label="E-mail" required>
          <Input
            id="admin-edit-email"
            type="email"
            value={data.email}
            maxLength={180}
            required
            onChange={(event) => setData({ ...data, email: event.target.value })}
          />
        </FormField>
        <FormField id="admin-edit-phone" label="Telefone" required>
          <Input
            id="admin-edit-phone"
            type="tel"
            value={data.phone}
            maxLength={20}
            required
            onChange={(event) => setData({ ...data, phone: event.target.value })}
          />
        </FormField>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="hero" disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
