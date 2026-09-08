/**
 * Enquanto a API original estiver fora do ar o site roda com o dataset local
 * de `src/data/store.ts`. Definir VITE_USE_MOCK=false volta a falar com o
 * backend real — nenhuma tela precisa mudar.
 */
export const USE_MOCK = import.meta.env["VITE_USE_MOCK"] !== "false";

export const API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "https://poanarua.com.br/api";

export const CONTACT = {
  EMAIL: "contato@poanarua.com.br",
  WHATSAPP: "5551996033460",
  INSTAGRAM: "poanarua",
  FACEBOOK: "poanarua",
  SITE: "https://poanarua.com.br/",
  TERMS: "https://poa-na-rua-0.flycricket.io/terms.html",
  PRIVACY: "https://poa-na-rua-0.flycricket.io/privacy.html",
  PLAY_STORE: "https://play.google.com/store/apps/details?id=com.guiipf.poanaruaoficial",
} as const;

/**
 * Conta que administra a plataforma.
 *
 * O login do /adm pede só a senha; o e-mail sai daqui. Não é segredo — é o
 * mesmo contato que aparece na página Sobre. O que protege é a senha, que
 * nunca vive no código: quem confere é o Supabase Auth.
 */
export const ADMIN_EMAIL =
  (import.meta.env["VITE_ADMIN_EMAIL"] as string | undefined) ?? CONTACT.EMAIL;

export const SITE = {
  name: "Poa na Rua",
  tagline: "Tudo que acontece em Porto Alegre",
  description:
    "Feiras, eventos de rua, shows, gastronomia e parques em Porto Alegre. Todos os dias, em um só lugar.",
} as const;
