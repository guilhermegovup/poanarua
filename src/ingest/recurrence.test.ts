import { describe, expect, it } from "vitest";

import { generateAgenda, AGENDA_FIXA, type FixedEvent } from "./sources/agenda-fixa";
import { instantAt, matches, occurrences } from "./recurrence";
import { runSource } from "./run";
import { agendaFixa } from "./sources";

/** Quarta-feira, 9 de setembro de 2026, meio-dia em Porto Alegre. */
const QUARTA = new Date("2026-09-09T12:00:00-03:00");

describe("occurrences", () => {
  it("acha os domingos da janela", () => {
    expect(occurrences({ kind: "semanal", weekdays: [0] }, QUARTA, 21)).toEqual([
      "2026-09-13",
      "2026-09-20",
      "2026-09-27",
    ]);
  });

  it("inclui o próprio dia quando a regra cai nele", () => {
    // Quarta é 3; a janela começa em hoje, não em amanhã.
    expect(occurrences({ kind: "semanal", weekdays: [3] }, QUARTA, 7)[0]).toBe("2026-09-09");
  });

  it("aceita mais de um dia da semana", () => {
    expect(occurrences({ kind: "semanal", weekdays: [0, 6] }, QUARTA, 10)).toEqual([
      "2026-09-12",
      "2026-09-13",
      "2026-09-19",
    ]);
  });

  it("filtra pela semana do mês na regra mensal", () => {
    // Sábados de setembro/2026: 5, 12, 19, 26 — o primeiro e o terceiro.
    const primeiroDeSetembro = new Date("2026-09-01T12:00:00-03:00");
    expect(
      occurrences({ kind: "mensal", weekdays: [6], nth: [1, 3] }, primeiroDeSetembro, 30),
    ).toEqual(["2026-09-05", "2026-09-19"]);
  });

  it("entende -1 como o último do mês", () => {
    const primeiroDeSetembro = new Date("2026-09-01T12:00:00-03:00");
    expect(
      occurrences({ kind: "mensal", weekdays: [6], nth: [-1] }, primeiroDeSetembro, 30),
    ).toEqual(["2026-09-26"]);
  });

  it("devolve vazio para janela negativa", () => {
    expect(occurrences({ kind: "semanal", weekdays: [0] }, QUARTA, -1)).toEqual([]);
  });

  it("usa o dia de Porto Alegre, não o do servidor", () => {
    // 22h de domingo em POA já é segunda em UTC. A regra é sobre o dia daqui.
    const domingoTarde = new Date("2026-09-13T22:00:00-03:00");
    expect(occurrences({ kind: "semanal", weekdays: [0] }, domingoTarde, 0)).toEqual([
      "2026-09-13",
    ]);
  });
});

describe("matches", () => {
  it("recusa dia da semana fora da regra", () => {
    expect(matches({ kind: "semanal", weekdays: [0] }, Date.UTC(2026, 8, 12))).toBe(false);
  });
});

describe("instantAt", () => {
  it("carimba o fuso de Porto Alegre", () => {
    expect(instantAt("2026-09-13", "09:00")).toBe("2026-09-13T09:00:00-03:00");
  });

  it("9h em Porto Alegre é meio-dia em UTC", () => {
    expect(new Date(instantAt("2026-09-13", "09:00")).toISOString()).toBe(
      "2026-09-13T12:00:00.000Z",
    );
  });
});

describe("generateAgenda", () => {
  it("gera uma ocorrência por data da regra", () => {
    const catalog: FixedEvent[] = [
      {
        name: "Feira de Teste",
        description: "<p>Teste</p>",
        address: "Praça Teste",
        hour: "08:00-12:00",
        startHour: "08:00",
        keywords: ["feira"],
        recurrence: { kind: "semanal", weekdays: [0] },
      },
    ];

    const raws = generateAgenda(QUARTA, catalog);
    expect(raws).toHaveLength(3);
    expect(raws[0]?.startDate).toBe("2026-09-13T08:00:00-03:00");
    expect(raws[0]?.hour).toBe("08:00-12:00");
    expect(raws[0]?.externalId).toBe("feira-de-teste-2026-09-13");
  });

  it("o catálogo real tem o Brique no domingo e a feira no sábado", () => {
    const brique = AGENDA_FIXA.find((item) => item.name.includes("Brique"));
    const feira = AGENDA_FIXA.find((item) => item.name.includes("Ecológica"));
    expect(brique?.recurrence).toEqual({ kind: "semanal", weekdays: [0] });
    expect(feira?.recurrence).toEqual({ kind: "semanal", weekdays: [6] });
  });
});

describe("agendaFixa como fonte", () => {
  it("roda sem tocar na rede", async () => {
    const fetchPage = () => {
      throw new Error("a agenda fixa não deveria baixar nada");
    };

    const result = await runSource(agendaFixa, { today: QUARTA, fetchPage });

    expect(result.skipped).toEqual([]);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events.every((event) => event.status === "pending")).toBe(true);
  });

  it("preserva o horário curado em vez de adivinhar pela ISO", () => {
    const brique = AGENDA_FIXA.find((item) => item.name.includes("Brique"))!;
    expect(brique.hour).toBe("09:00-17:00");
  });

  it("cada data tem chave de dedupe própria", async () => {
    const result = await runSource(agendaFixa, { today: QUARTA });
    const keys = result.events.map((event) => event.dedupe_key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("rodar de novo com as chaves conhecidas não repete nada", async () => {
    const first = await runSource(agendaFixa, { today: QUARTA });
    const knownKeys = new Set(first.events.map((event) => event.dedupe_key!));

    const second = await runSource(agendaFixa, { today: QUARTA, knownKeys });

    expect(second.events).toEqual([]);
    expect(second.duplicates).toBe(first.events.length);
  });

  it("classifica o Brique como feira ao ar livre e gratuita", async () => {
    const result = await runSource(agendaFixa, { today: QUARTA });
    const brique = result.events.find((event) => event.name === "Brique da Redenção");

    const tags = brique?.tags.map((tag) => tag.name) ?? [];
    expect(tags).toContain("GRATUITO");
    expect(tags).toContain("AO AR LIVRE");
    expect(tags).toContain("PET FRIENDLY");
    expect(brique?.hour).toBe("09:00-17:00");
    expect(brique?.locations).toHaveLength(1);
  });
});
