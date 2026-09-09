import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { parseQuickFilters } from "./filters";
import { clearCache, persistCache, restoreCache } from "./offline-cache";

describe("parseQuickFilters", () => {
  it("lê a lista separada por vírgula", () => {
    expect(parseQuickFilters("hoje,gratis")).toEqual(["hoje", "gratis"]);
  });

  it("aceita um só", () => {
    expect(parseQuickFilters("fim-de-semana")).toEqual(["fim-de-semana"]);
  });

  it("descarta o que não reconhece em vez de reclamar", () => {
    // Link antigo com recorte que não existe mais abre a home, não um erro.
    expect(parseQuickFilters("xpto,gratis")).toEqual(["gratis"]);
  });

  it("tolera espaço em volta", () => {
    expect(parseQuickFilters("hoje , criancas")).toEqual(["hoje", "criancas"]);
  });

  it("não repete", () => {
    expect(parseQuickFilters("hoje,hoje")).toEqual(["hoje"]);
  });

  it("devolve vazio para ausente, vazio ou tipo errado", () => {
    expect(parseQuickFilters(undefined)).toEqual([]);
    expect(parseQuickFilters("")).toEqual([]);
    expect(parseQuickFilters(42)).toEqual([]);
  });

  it("também aceita array, para link antigo com o formato do roteador", () => {
    expect(parseQuickFilters(["hoje", "amanha"])).toEqual(["hoje", "amanha"]);
  });
});

describe("cache offline sem IndexedDB", () => {
  // Servidor, aba anônima ou aparelho com armazenamento bloqueado: o app tem
  // de funcionar igual, só sem a parte offline.
  it("restaurar não quebra e diz que não achou nada", async () => {
    await expect(restoreCache(new QueryClient())).resolves.toBe(false);
  });

  it("persistir devolve um cancelador que não explode", () => {
    const stop = persistCache(new QueryClient());
    expect(() => stop()).not.toThrow();
  });

  it("limpar não quebra", async () => {
    await expect(clearCache()).resolves.toBeUndefined();
  });
});
