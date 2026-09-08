import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { extractFeed, extractJsonLd } from "./extract";
import { dedupeKey, inferCategories, inferTags, parseDate, parseHour } from "./normalize";
import { runSource } from "./run";
import { extractCards, destinoPoa } from "./sources/destino-poa";

const fixture = (name: string) => readFileSync(join(__dirname, "__fixtures__", name), "utf8");

const PAGE = "https://destinopoa.com.br/eventos/";
const TODAY = new Date("2026-09-08T12:00:00-03:00");

describe("extractJsonLd", () => {
  const events = extractJsonLd(fixture("jsonld.html"), PAGE);

  it("pega Event e subtipos como ChildrensEvent, ignorando o resto do @graph", () => {
    expect(events.map((event) => event.name)).toEqual([
      "Feira Orgânica do Bom Fim",
      "Contação de histórias na Redenção",
    ]);
  });

  it("monta o endereço a partir do Place e da PostalAddress", () => {
    expect(events[0]?.address).toBe(
      "Parque Farroupilha - Av. José Bonifácio, s/n - Porto Alegre - RS",
    );
    expect(events[0]?.latitude).toBe("-30.036389");
  });

  it("resolve URLs relativas contra a página", () => {
    expect(events[0]?.imageUrl).toBe(
      "https://destinopoa.com.br/wp-content/uploads/feira-organica.jpg",
    );
    expect(events[1]?.url).toBe("https://destinopoa.com.br/eventos/contacao-historias");
  });

  it("lê preço zero como gratuito", () => {
    expect(events[0]?.offers).toBe("Gratuito");
  });
});

describe("extractFeed", () => {
  const events = extractFeed(fixture("feed.xml"), PAGE);

  it("lê os itens do RSS, inclusive CDATA", () => {
    expect(events).toHaveLength(2);
    expect(events[0]?.name).toBe("Feira de Artesanato da Praça da Alfândega");
  });

  it("aproveita a imagem que só existe dentro da descrição", () => {
    expect(events[0]?.imageUrl).toBe("https://destinopoa.com.br/uploads/alfandega.jpg");
  });

  it("guarda as categorias do feed como palavras-chave", () => {
    expect(events[0]?.keywords).toEqual(["Artesanato", "Ao ar livre"]);
  });
});

describe("extractCards", () => {
  const events = extractCards(fixture("cards.html"), PAGE);

  it("pega só os links que parecem de evento", () => {
    expect(events.map((event) => event.name)).toEqual([
      "Oficina de teatro infantil",
      "Mirante do Morro Santa Teresa",
    ]);
  });

  it("aceita imagem em data-src, comum em lazy loading", () => {
    expect(events[0]?.imageUrl).toBe("https://destinopoa.com.br/uploads/teatro-infantil.jpg");
  });
});

describe("parseDate", () => {
  it("aceita ISO com fuso", () => {
    expect(parseDate("2026-10-10T07:00:00-03:00")).toBe("2026-10-10T10:00:00.000Z");
  });

  it("aceita data brasileira numérica", () => {
    expect(parseDate("17/10/2026", TODAY)?.slice(0, 10)).toBe("2026-10-17");
  });

  it("aceita data por extenso", () => {
    expect(parseDate("24 de outubro de 2026", TODAY)?.slice(0, 10)).toBe("2026-10-24");
  });

  it("sem ano, joga para a próxima ocorrência", () => {
    // 3 de março já passou em relação a setembro de 2026.
    expect(parseDate("3 de março", TODAY)?.slice(0, 10)).toBe("2027-03-03");
  });

  it("devolve null quando não há data", () => {
    expect(parseDate("aberto todos os dias")).toBeNull();
    expect(parseDate(undefined)).toBeNull();
  });
});

describe("parseHour", () => {
  it("monta o intervalo a partir de texto corrido", () => {
    expect(parseHour("das 9h às 18h na Praça")).toBe("09:00-18:00");
    expect(parseHour("Concerto às 19h")).toBe("19:00");
  });

  it("ignora números que não são hora", () => {
    expect(parseHour("para crianças de 3 a 10 anos")).toBe("");
  });
});

describe("inferência", () => {
  it("reconhece evento infantil", () => {
    const categories = inferCategories({
      name: "Contação de histórias",
      description: "Tarde para crianças de 3 a 10 anos",
    });
    expect(categories[0]?.name).toBe("PARA CRIANÇAS");
    expect(inferTags({ name: "Contação de histórias para crianças" }).map((t) => t.name)).toContain(
      "PARA CRIANÇAS",
    );
  });

  it("reconhece feira orgânica", () => {
    expect(inferCategories({ name: "Feira Orgânica do Bom Fim" })[0]?.name).toBe(
      "FEIRAS ORGÂNICAS E ECOLÓGICAS",
    );
  });

  it("cai em EVENTOS DE RUA quando não há pista", () => {
    expect(inferCategories({ name: "Encontro" })[0]?.name).toBe("EVENTOS DE RUA");
  });

  it("marca GRATUITO a partir do texto", () => {
    const tags = inferTags({ name: "Concerto", description: "Entrada gratuita" });
    expect(tags.map((tag) => tag.name)).toContain("GRATUITO");
  });
});

describe("dedupeKey", () => {
  it("ignora artigos e preposições, então títulos parecidos colidem", () => {
    expect(dedupeKey("A Feira de Artesanato da Praça", "2026-10-17T12:00:00.000Z")).toBe(
      dedupeKey("Feira Artesanato Praça", "2026-10-17T00:00:00.000Z"),
    );
  });

  it("mesma feira em dias diferentes são eventos diferentes", () => {
    expect(dedupeKey("Brique da Redenção", "2026-10-17T12:00:00.000Z")).not.toBe(
      dedupeKey("Brique da Redenção", "2026-10-24T12:00:00.000Z"),
    );
  });
});

describe("runSource", () => {
  const pages: Record<string, string> = {
    "https://destinopoa.com.br/eventos/": fixture("jsonld.html"),
    "https://destinopoa.com.br/agenda/": fixture("cards.html"),
    "https://destinopoa.com.br/o-que-fazer/": fixture("cards.html"),
    "https://destinopoa.com.br/feed/": fixture("feed.xml"),
  };

  const fetchPage = async (url: string) => {
    const body = pages[url];
    if (!body) throw new Error("404");
    return body;
  };

  it("junta as páginas, normaliza e marca tudo como pendente", async () => {
    const result = await runSource(destinoPoa, { fetchPage, today: TODAY });

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events.every((event) => event.status === "pending")).toBe(true);
    expect(result.events.every((event) => event.source?.id === "destino-poa")).toBe(true);
  });

  it("descarta a repetição entre listagem e feed", async () => {
    const result = await runSource(destinoPoa, { fetchPage, today: TODAY });
    // /agenda/ e /o-que-fazer/ servem a mesma fixture: a segunda vira duplicata.
    expect(result.duplicates).toBeGreaterThan(0);
  });

  it("respeita as chaves já conhecidas da base", async () => {
    const primeira = await runSource(destinoPoa, { fetchPage, today: TODAY });
    const conhecidas = new Set(primeira.events.map((event) => event.dedupe_key!));

    const segunda = await runSource(destinoPoa, {
      fetchPage,
      today: TODAY,
      knownKeys: conhecidas,
    });

    expect(segunda.events).toHaveLength(0);
  });

  it("uma página fora do ar não derruba a coleta inteira", async () => {
    const result = await runSource(destinoPoa, {
      today: TODAY,
      fetchPage: async (url) => {
        if (url.endsWith("/agenda/")) throw new Error("HTTP 500");
        return fetchPage(url);
      },
    });

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.skipped.some((item) => item.reason.includes("500"))).toBe(true);
  });
});
