import { dehydrate, hydrate, type QueryClient } from "@tanstack/react-query";

/**
 * Guarda a programação já vista para o app abrir sem rede.
 *
 * O service worker cacheia HTML, JS e imagens — mas os eventos vêm do
 * Supabase, que é outra origem. Sem isto, o app instalado abre bonito no
 * ônibus, roda a consulta, falha, e mostra "não consegui carregar". Ou seja:
 * instalava, mas offline não servia para nada.
 *
 * Agora a última resposta boa fica no IndexedDB e volta na abertura seguinte.
 * O TanStack Query trata o que voltou como dado velho: mostra na hora e
 * revalida contra a rede, então online ninguém vê programação de ontem.
 *
 * localStorage não serviria: é síncrono, trava a thread da interface e tem
 * limite apertado para dezenas de eventos com descrição.
 */

const DB_NAME = "poanarua";
const STORE = "cache";
const KEY = "queries";
const DB_VERSION = 1;

/** Depois disso a programação guardada é velha demais para valer alguma coisa. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Escrever a cada mudança do cache seria escrever a cada tecla na busca. */
const DEBOUNCE_MS = 1_000;

interface Snapshot {
  savedAt: number;
  state: unknown;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

/**
 * O que vale guardar.
 *
 * Só consulta bem-sucedida, e nada do webadmin: dado velho ali confunde a
 * curadoria, e a fila de revisão de quem administra não tem por que morar no
 * aparelho de quem só quer ver o que rola no sábado.
 */
function isWorthKeeping(queryKey: readonly unknown[], status: string): boolean {
  if (status !== "success") return false;
  const head = String(queryKey[0] ?? "");
  return !head.startsWith("admin");
}

/** Devolve true quando havia programação guardada e ela entrou no cache. */
export async function restoreCache(queryClient: QueryClient): Promise<boolean> {
  if (typeof indexedDB === "undefined") return false;

  try {
    const snapshot = await withStore<Snapshot | undefined>("readonly", (store) => store.get(KEY));

    if (!snapshot) return false;

    if (Date.now() - snapshot.savedAt > MAX_AGE_MS) {
      await clearCache();
      return false;
    }

    hydrate(queryClient, snapshot.state);
    return true;
  } catch {
    // Aparelho sem IndexedDB, aba anônima, cota estourada: o app funciona
    // igual, só sem a parte offline. Não é motivo para quebrar a abertura.
    return false;
  }
}

/** Passa a salvar o cache a cada mudança. Devolve como parar. */
export function persistCache(queryClient: QueryClient): () => void {
  if (typeof indexedDB === "undefined") return () => undefined;

  let timer: ReturnType<typeof setTimeout> | undefined;

  const save = async () => {
    try {
      const state = dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => isWorthKeeping(query.queryKey, query.state.status),
      });

      await withStore("readwrite", (store) =>
        store.put({ savedAt: Date.now(), state } satisfies Snapshot, KEY),
      );
    } catch {
      // Idem: falhar ao guardar não pode atrapalhar quem está navegando.
    }
  };

  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, DEBOUNCE_MS);
  });

  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
  };
}

export async function clearCache(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    await withStore("readwrite", (store) => store.delete(KEY));
  } catch {
    // Nada a fazer: o próximo restore descarta pela idade de qualquer jeito.
  }
}
