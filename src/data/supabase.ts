import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase as lovableClient } from "@/integrations/supabase/client";

/**
 * Ponte para o cliente do Lovable Cloud.
 *
 * `src/integrations/supabase/client.ts` é gerado pelo Lovable e cuida do
 * storage de sessão do preview, das chaves de API novas e do SSR. Criar um
 * segundo cliente aqui daria duas sessões de auth concorrendo, então este
 * módulo só decide *se* há banco e devolve o cliente deles.
 */

const env = import.meta.env as Record<string, string | undefined>;

/** O cliente do Lovable lança se as variáveis faltarem — por isso checamos antes. */
export const isRemote = Boolean(env["VITE_SUPABASE_URL"] && env["VITE_SUPABASE_PUBLISHABLE_KEY"]);

export const supabase: SupabaseClient | null = isRemote
  ? (lovableClient as unknown as SupabaseClient)
  : null;

/** Uso interno: só chame depois de checar `isRemote`. */
export function requireSupabase(): SupabaseClient {
  if (!isRemote) {
    throw new Error("Supabase não configurado. Ligue o Lovable Cloud para o site usar o banco.");
  }
  return lovableClient as unknown as SupabaseClient;
}
