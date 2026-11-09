import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel de usuários — Mars Real Estate" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute requireAdmin>
      <AdminUsersPanel />
    </ProtectedRoute>
  ),
});
