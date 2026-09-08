import { useQuery } from "@tanstack/react-query";

import { api } from "@/data/api";

/** Chaves centralizadas para as invalidações ficarem previsíveis. */
export const queryKeys = {
  events: ["events"] as const,
  event: (id: number) => ["event", id] as const,
  categories: ["categories"] as const,
  favorites: ["favorites"] as const,
  evaluations: (id: number) => ["evaluations", id] as const,
  myEvents: ["my-events"] as const,
};

export function useEvents() {
  return useQuery({ queryKey: queryKeys.events, queryFn: api.events });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => api.event(id),
    enabled: Number.isFinite(id),
  });
}

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: api.categories });
}

export function useEvaluations(id: number) {
  return useQuery({
    queryKey: queryKeys.evaluations(id),
    queryFn: () => api.evaluations(id),
    enabled: Number.isFinite(id),
  });
}

export function useMyEvents() {
  return useQuery({ queryKey: queryKeys.myEvents, queryFn: api.myEvents });
}
