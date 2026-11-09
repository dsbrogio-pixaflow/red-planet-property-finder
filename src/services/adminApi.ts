import { apiRequest } from "@/services/apiClient";
import type { AuthUser } from "@/services/authService";

export interface AdminUser extends AuthUser {
  createdAt: string;
  phone: string;
}

export type AdminUserUpdate = Pick<AdminUser, "fullName" | "email" | "phone">;

export const adminApi = {
  listUsers: () => apiRequest<AdminUser[]>("/api/admin/users"),
  grantAdministrator: (id: number) =>
    apiRequest<AdminUser>(`/api/admin/users/${id}/administrator`, { method: "PUT" }),
  updateUser: (id: number, data: AdminUserUpdate) =>
    apiRequest<AdminUser>(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: number) => apiRequest<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
};
