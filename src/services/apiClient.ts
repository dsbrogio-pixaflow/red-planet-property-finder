
import { authService } from "@/services/authService";

// Endereço do backend Spring Boot
const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8081";

// Identificar endpoints que não exigem autenticação
function isPublicEndpoint(path: string): boolean {
  const pathname = path.split("?")[0].split("#")[0];

  return (
    pathname === "/api/public" ||
    pathname.startsWith("/api/public/") ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/register" ||
    pathname === "/api/status"
  );
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {

  const headers = new Headers(options.headers);

  // Aceitar respostas JSON
  headers.set("Accept", "application/json");

  // Configurar Content-Type somente para corpos JSON em texto
  if (
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Verificar se o endpoint é público
  const publicEndpoint = isPublicEndpoint(path);

  if (publicEndpoint) {
    // Não enviar JWT em consultas públicas.
    // Isso evita que tokens expirados provoquem HTTP 401.
    headers.delete("Authorization");

  } else {

    // Recuperar token da sessão autenticada
    const token = authService.getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }
  }

  // Executar requisição
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // Tratar respostas sem conteúdo
  if (response.status === 204) {
    return undefined as T;
  }

  // Ler resposta do servidor
  const responseText = await response.text();

  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  // Tratar erros HTTP
  if (!response.ok) {

    const errorData =
      typeof data === "object" && data !== null
        ? data as {
            detail?: string;
            message?: string;
            title?: string;
          }
        : null;

    const serverMessage =
      errorData?.detail ??
      errorData?.message ??
      errorData?.title;

    // Mensagem específica para sessões inválidas
    if (response.status === 401 && !publicEndpoint) {
      throw new Error(
        serverMessage ??
        "Sua sessão expirou ou não é válida. Entre novamente na sua conta."
      );
    }

    throw new Error(
      serverMessage ??
      `Erro HTTP ${response.status}`
    );
  }

  return data as T;
}
