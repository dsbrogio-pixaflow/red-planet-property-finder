/**
 * Serviço de autenticação — MODO DEMONSTRATIVO.
 * Nenhuma credencial é validada, enviada ou armazenada.
 * Na próxima etapa: e-mail/senha, Google OAuth e recuperação de senha via Lovable Cloud;
 * permissões administrativas verificadas no servidor e por políticas de acesso ao banco.
 */
import type { Advertiser, DemoUser } from "@/types/property";

export const DEMO_NOTICE =
  "A autenticação será implementada na próxima etapa. Nenhum dado foi enviado ou armazenado.";

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

export const authService = {
  /** Retorna o usuário demonstrativo; futuramente, a sessão real. */
  getCurrentUser: (): DemoUser => DEMO_USER,
  /** Futuramente verificado no servidor. Aqui sempre libera em modo demo. */
  canAccessAdmin: (): boolean => true,
};

/** Upload de imagens — demonstrativo: apenas pré-visualização local. */
export const storageService = {
  previewFile: (file: File) => URL.createObjectURL(file),
};
