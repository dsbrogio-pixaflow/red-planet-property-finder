/** Mantém os dados demonstrativos separados da autenticação real do backend. */
import type { Advertiser, DemoUser } from "@/types/property";

export const DEMO_NOTICE =
  "Esta ação permanece demonstrativa. Nenhum dado foi enviado ou armazenado.";

export const DEMO_USER: DemoUser = {
  id: "demo-user",
  name: "Visitante (demonstração)",
  email: "visitante@exemplo.invalid",
  role: "user",
};

export const DEMO_USER_ADVERTISER: Advertiser = {
  id: DEMO_USER.id,
  name: DEMO_USER.name,
  role: "user",
};

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  accountType: "OWNER" | "AGENCY";
}

interface AuthSession {
  user: AuthUser;
  token: string;
}

const AUTH_STORAGE_KEY = "mars-auth-session";
const AUTH_EVENT = "mars-auth-changed";
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8081";

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) as AuthSession : null;
  } catch {
    return null;
  }
}

async function requestAuth(path: string, body: object): Promise<AuthUser> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as Partial<AuthUser & { token: string; message: string }>;
  if (!response.ok) throw new Error(data.message || "Não foi possível concluir a autenticação.");
  if (!data.token || !data.id || !data.fullName || !data.email || !data.accountType) {
    throw new Error("Resposta de autenticação inválida.");
  }
  const session: AuthSession = {
    user: {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      accountType: data.accountType,
    },
    token: data.token,
  };
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_EVENT));
  return session.user;
}

export const authService = {
  getCurrentUser: (): AuthUser | null => getStoredSession()?.user ?? null,
  getToken: (): string | null => getStoredSession()?.token ?? null,
  canAccessAdmin: (): boolean => getStoredSession()?.user.accountType === "AGENCY",
  login: (email: string, password: string) => requestAuth("/api/auth/login", { email, password }),
  register: (fullName: string, email: string, phone: string, password: string, accountType: "OWNER" | "AGENCY") =>
    requestAuth("/api/auth/register", { fullName, email, phone, password, accountType }),
  logout: () => {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
  },
  subscribe: (listener: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(AUTH_EVENT, listener);
    return () => window.removeEventListener(AUTH_EVENT, listener);
  },
};

/** Upload de imagens — demonstrativo: apenas pré-visualização local. */
export const storageService = {
  previewFile: (file: File) => URL.createObjectURL(file),
};
