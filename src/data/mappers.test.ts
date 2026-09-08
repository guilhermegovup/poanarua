import { describe, expect, it } from "vitest";

import { toCategory, toEvaluation, toEvent, toEventRow, type EventRow } from "./mappers";

/**
 * O mapeamento entre as linhas do Postgres e o `EventItem` é onde um erro passa
 * despercebido até quebrar em produção: nome de coluna, relacionamento aninhado
 * vazio, coordenada nula. Estes testes fixam o contrato.
 */

const linhaCompleta: EventRow = {
  id: 12,
  name: "Feira Orgânica do Bom Fim",
  description: "<p>Produtores da região</p>",
  address: "Parque Farroupilha",
  starts_at: "2026-10-10T10:00:00.000Z",
  ends_at: "2026-10-10T16:00:00.000Z",
  hour: "07:00-13:00",
  image_url: "https://exemplo.com/feira.jpg",
  banner: "TOP",
  featured: true,
  prioritized: true,
  latitude: -30.036389,
  longitude: -51.213611,
  status: "published",
  source_id: "destino-poa",
  source_name: "Destino POA",
  source_url: "https://destinopoa.com.br/eventos/feira",
  external_id: "4821",
  imported_at: "2026-09-08T12:00:00.000Z",
  dedupe_key: "feira-organica-bom-fim@2026-10-10",
  created_by: null,
  event_categories: [
    { categories: { id: 22, name: "FEIRAS ORGÂNICAS E ECOLÓGICAS", order: 2, image_url: null } },
    { categories: null },
  ],
  event_tags: [{ tags: { id: 1, name: "FEIRA DE RUA" } }, { tags: null }],
  event_contacts: [
    { id: 1, type: "instagram", value: "feiraorganica" },
    { id: 2, type: "telegram", value: "ignorado" },
  ],
};

describe("toEvent", () => {
  const event = toEvent(linhaCompleta);

  it("traduz os campos principais", () => {
    expect(event.id).toBe(12);
    expect(event.name).toBe("Feira Orgânica do Bom Fim");
    expect(event.date).toBe("2026-10-10T10:00:00.000Z");
    expect(event.status).toBe("published");
  });

  it("formata a data brasileira que os cards usam", () => {
    expect(event.event_date).toBe("10/10/2026");
  });

  it("descarta relacionamento vazio sem quebrar", () => {
    expect(event.categories).toHaveLength(1);
    expect(event.tags).toHaveLength(1);
  });

  it("ignora tipo de contato que não existe no app", () => {
    expect(event.contacts.map((contact) => contact.type)).toEqual(["instagram"]);
  });

  it("monta a procedência para o crédito no admin", () => {
    expect(event.source).toEqual({
      id: "destino-poa",
      name: "Destino POA",
      url: "https://destinopoa.com.br/eventos/feira",
      external_id: "4821",
      imported_at: "2026-09-08T12:00:00.000Z",
    });
  });

  it("converte coordenadas numéricas para o formato das telas", () => {
    expect(event.locations).toEqual([{ latitude: "-30.036389", longitude: "-51.213611" }]);
  });
});

describe("toEvent com linha mínima", () => {
  const minima: EventRow = {
    ...linhaCompleta,
    description: null,
    address: null,
    ends_at: null,
    hour: null,
    image_url: null,
    banner: null,
    latitude: null,
    longitude: null,
    source_id: null,
    source_name: null,
    source_url: null,
    external_id: null,
    imported_at: null,
    dedupe_key: null,
    event_categories: null,
    event_tags: null,
    event_contacts: null,
  };

  const event = toEvent(minima);

  it("não deixa nulo vazar para as telas", () => {
    expect(event.description).toBe("");
    expect(event.address).toBe("");
    expect(event.hour).toBe("");
    expect(event.categories).toEqual([]);
    expect(event.contacts).toEqual([]);
  });

  it("sem coordenada, não inventa localização", () => {
    expect(event.locations).toEqual([]);
  });

  it("sem imagem, gera uma capa provisória", () => {
    expect(event.image.url).toContain("evento-12");
  });

  it("evento cadastrado à mão não tem procedência", () => {
    expect(event.source).toBeUndefined();
  });
});

describe("toEventRow", () => {
  it("só envia o que o formulário mexeu", () => {
    expect(toEventRow({ name: "Novo" })).toEqual({ name: "Novo" });
  });

  it("traduz para os nomes de coluna do banco", () => {
    const row = toEventRow({
      name: "Feira",
      date: "2026-10-10T12:00:00.000Z",
      date_final: "2026-10-11T12:00:00.000Z",
      image: "https://exemplo.com/a.jpg",
    });

    expect(row).toMatchObject({
      name: "Feira",
      starts_at: "2026-10-10T12:00:00.000Z",
      ends_at: "2026-10-11T12:00:00.000Z",
      image_url: "https://exemplo.com/a.jpg",
    });
  });

  it("data final vazia vira null, não string vazia", () => {
    expect(toEventRow({ date_final: "" })["ends_at"]).toBeNull();
  });

  it("localização vazia limpa as coordenadas", () => {
    const row = toEventRow({ locations: [] });
    expect(row["latitude"]).toBeNull();
    expect(row["longitude"]).toBeNull();
  });
});

describe("toCategory", () => {
  it("só inclui url quando existe imagem", () => {
    expect(toCategory({ id: 1, name: "A", order: 1, image_url: null })).toEqual({
      id: 1,
      name: "A",
      order: 1,
    });
  });
});

describe("toEvaluation", () => {
  it("cai para Anônimo quando o perfil não veio", () => {
    const evaluation = toEvaluation({
      id: 3,
      note: 5,
      comment: "Muito bom",
      created_at: "2026-10-10T12:00:00.000Z",
    });

    expect(evaluation.name).toBe("Anônimo");
    expect(evaluation.avatar).toBeNull();
    expect(evaluation.last_comment).toBe("10/10/2026");
  });
});
