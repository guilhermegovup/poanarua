import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente do Supabase (Lovable Cloud).
 *
 * As variáveis são injetadas pelo Lovable quando o Cloud está ligado. Os nomes
 * mudaram de `ANON_KEY` para `PUBLISHABLE_KEY` em algum momento, então aceitamos
 * os dois. Sem elas o site continua rodando no store local — assim o preview
 * nunca quebra por falta de configuração.
 */

const env = import.meta.env as Record<string, string | undefined>;

const url = env["VITE_SUPABASE_URL"];
const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? env["VITE_SUPABASE_ANON_KEY"];

export const isRemote = Boolean(url && key);

export const supabase: SupabaseClient | null = isRemote
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Uso interno: só chame depois de checar `isRemote`. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return supabase;
}
