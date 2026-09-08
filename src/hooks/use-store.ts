import { useSyncExternalStore } from "react";

import { store, subscribe } from "@/data/store";
import type { User } from "@/data/types";

/**
 * `useSyncExternalStore` mantém favoritos, "eu vou" e sessão em sincronia em
 * todas as telas abertas sem precisar de um provider global.
 */
function useStoreValue<T>(selector: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribe, selector, () => serverValue);
}

export function useUser(): User | null {
  return useStoreValue(() => store.user(), null);
}

export function useIsFavorite(eventId: number): boolean {
  return useStoreValue(() => store.favorites().includes(eventId), false);
}

export function useFavoriteCount(): number {
  return useStoreValue(() => store.favorites().length, 0);
}

export function useIsGoing(eventId: number): boolean {
  return useStoreValue(() => store.isGoing(eventId), false);
}

export function useGoEventCount(eventId: number): number {
  return useStoreValue(() => store.goEventUsers(eventId).length, 0);
}
