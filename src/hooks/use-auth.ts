import { useCallback, useEffect, useState } from "react";

import { getSession, type Session } from "@/data/auth";
import { isRemote, supabase } from "@/data/supabase";
import { subscribe } from "@/data/store";

/**
 * Sessão atual. Escuta o Supabase quando o banco está ligado e o store local
 * quando não está, para as telas reagirem a login e logout do mesmo jeito nos
 * dois modos.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setSession(await getSession());
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    if (isRemote && supabase) {
      const { data } = supabase.auth.onAuthStateChange(() => {
        refresh();
      });
      return () => data.subscription.unsubscribe();
    }

    return subscribe(refresh);
  }, [refresh]);

  return {
    session,
    user: session?.user ?? null,
    isAdmin: session?.isAdmin ?? false,
    loading,
    refresh,
  };
}
