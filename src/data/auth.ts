import type { User } from "./types";
import { store } from "./store";
import { isRemote, requireSupabase } from "./supabase";
import * as remote from "./remote";

/**
 * Autenticação.
 *
 * Com o Lovable Cloud ligado, é o Supabase Auth. Sem ele, cai numa sessão
 * local só para o preview continuar navegável — nesse modo `isAdmin` é sempre
 * falso, porque não há nada para proteger nem como proteger.
 */

export interface Session {
  user: User;
  isAdmin: boolean;
}

function toUser(id: string, email: string | undefined, name: string | undefined): User {
  return {
    // As telas esperam id numérico; o uuid vira uma chave estável só para React.
    id: Number.parseInt(id.replace(/\D/g, "").slice(0, 9) || "0", 10),
    name: name ?? email?.split("@")[0] ?? "Anônimo",
    email: email ?? "",
    provider: "EMAIL",
  };
}

export async function getSession(): Promise<Session | null> {
  if (!isRemote) {
    const user = store.user();
    return user ? { user, isAdmin: false } : null;
  }

  const { data } = await requireSupabase().auth.getUser();
  if (!data.user) return null;

  const name = (data.user.user_metadata as { name?: string } | null)?.name;
  return {
    user: toUser(data.user.id, data.user.email, name),
    isAdmin: await remote.isAdmin(),
  };
}

export async function signIn(email: string, password: string): Promise<Session> {
  if (!isRemote) {
    const user = store.signIn(email);
    return { user, isAdmin: false };
  }

  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(traduzir(error.message));
  if (!data.user) throw new Error("Não consegui entrar. Tenta de novo.");

  const name = (data.user.user_metadata as { name?: string } | null)?.name;
  return {
    user: toUser(data.user.id, data.user.email, name),
    isAdmin: await remote.isAdmin(),
  };
}

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ needsConfirmation: boolean }> {
  if (!isRemote) {
    store.signIn(email, name);
    return { needsConfirmation: false };
  }

  const options: { data: { name: string }; emailRedirectTo?: string } = {
    data: { name },
  };
  if (typeof window !== "undefined") options.emailRedirectTo = window.location.origin;

  const { data, error } = await requireSupabase().auth.signUp({ email, password, options });

  if (error) throw new Error(traduzir(error.message));
  return { needsConfirmation: !data.session };
}

export async function signOut(): Promise<void> {
  if (!isRemote) {
    store.signOut();
    return;
  }
  await requireSupabase().auth.signOut();
}

/** O Supabase responde em inglês; estas são as mensagens que aparecem de fato. */
function traduzir(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "Confirma teu e-mail antes de entrar.",
    "User already registered": "Já existe uma conta com esse e-mail.",
    "Password should be at least 6 characters": "A senha deve conter no mínimo 6 caracteres.",
    "Unable to validate email address: invalid format": "E-mail inválido.",
  };
  return map[message] ?? message;
}
