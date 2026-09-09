import { describe, expect, it } from "vitest";

import { extractDetail, mergeDetail } from "./extract";
import { runSource } from "./run";
import type { RawEvent, Source } from "./types";

const LISTAGEM = `
  <a href="/eventos/feira-do-livro/"><h3>Feira do Livro</h3></a>
  <a href="/eventos/show-na-praca/"><h3>Show na Praça</h3></a>
`;

/** Página de evento como um WordPress qualquer publica: Open Graph e nada mais. */
const DETALHE_OG = `
  <html><head>
    <meta property="og:title" content="Feira do Livro" />
    <meta property="og:description" content="Duas semanas de livros na Praça da Alfândega." />
    <meta property="og:image" content="/wp-content/uploads/feira.jpg" />
  </head><body></body></html>
`;

/** Página com JSON-LD completo — o caso bom. */
const DETALHE_JSONLD = `
  <html><head>
    <meta property="og:image" content="/og-generico.jpg" />
    <script type="application/ld+json">
      {
        "@type": "Event",
        "name": "Show na Praça",
        "description": "Samba de roda ao pôr do sol.",
        "startDate": "2026-10-03T19:00:00-03:00",
        "image": "https://exemplo.com.br/foto-real.jpg",
        "location": {
          "@type": "Place",
          "name": "Praça da Matriz",
          "address": "Praça Marechal Deodoro, Centro"
        }
      }
    </script>
  </head><body></body></html>
`;

const fonte: Source = {
  id: "teste",
  name: "Fonte de Teste",
  homepage: "https://exemplo.com.br",
  entrypoints: ["https://exemplo.com.br/eventos/"],
  extract: (body, url) => {
    const events: RawEvent[] = [];
    for (const match of body.matchAll(/<a href="([^"]+)"><h3>([^<]+)<\/h3><\/a>/g)) {
      events.push({ name: match[2]!, url: new URL(match[1]!, url).toString() });
    }
    return events;
  },
};

function fetchFake(pages: Record<string, string>) {
  const visitadas: string[] = [];
  const fetchPage = async (url: string) => {
    visitadas.push(url);
    const body = pages[url];
    if (body === undefined) throw new Error(`HTTP 404 em ${url}`);
    return body;
  };
  return { fetchPage, visitadas };
}

describe("extractDetail", () => {
  it("lê foto e texto do Open Graph", () => {
    const detail = extractDetail(DETALHE_OG, "https://exemplo.com.br/eventos/feira-do-livro/");
    expect(detail.description).toBe("Duas semanas de livros na Praça da Alfândega.");
    expect(detail.imageUrl).toBe("https://exemplo.com.br/wp-content/uploads/feira.jpg");
  });

  it("prefere o JSON-LD ao Open Graph quando os dois existem", () => {
    const detail = extractDetail(DETALHE_JSONLD, "https://exemplo.com.br/eventos/show-na-praca/");
    expect(detail.imageUrl).toBe("https://exemplo.com.br/foto-real.jpg");
    expect(detail.description).toBe("Samba de roda ao pôr do sol.");
    expect(detail.address).toContain("Praça Marechal Deodoro");
  });

  it("aceita a meta com os atributos na ordem invertida", () => {
    const detail = extractDetail(
      `<meta content="Texto virado" property="og:description">`,
      "https://exemplo.com.br/",
    );
    expect(detail.description).toBe("Texto virado");
  });

  it("cai para a description comum quando não há Open Graph", () => {
    const detail = extractDetail(
      `<meta name="description" content="Resumo simples">`,
      "https://exemplo.com.br/",
    );
    expect(detail.description).toBe("Resumo simples");
  });

  it("devolve vazio numa página sem nada", () => {
    expect(extractDetail("<html><body>oi</body></html>", "https://exemplo.com.br/")).toEqual({});
  });
});

describe("mergeDetail", () => {
  it("a listagem manda: detalhe só preenche buraco", () => {
    const merged = mergeDetail(
      { name: "Nome da listagem", url: "https://x/1", imageUrl: "https://x/miniatura.jpg" },
      { name: "Nome do detalhe", imageUrl: "https://x/grande.jpg", description: "Texto" },
    );

    expect(merged.name).toBe("Nome da listagem");
    expect(merged.imageUrl).toBe("https://x/miniatura.jpg");
    expect(merged.description).toBe("Texto");
  });

  it("ignora valor vazio do detalhe", () => {
    const merged = mergeDetail({ name: "A", description: "Original" }, { description: "" });
    expect(merged.description).toBe("Original");
  });
});

describe("runSource com enriquecimento", () => {
  const pages = {
    "https://exemplo.com.br/eventos/": LISTAGEM,
    "https://exemplo.com.br/eventos/feira-do-livro/": DETALHE_OG,
    "https://exemplo.com.br/eventos/show-na-praca/": DETALHE_JSONLD,
  };

  it("abre a página de cada evento e traz foto e texto", async () => {
    const { fetchPage, visitadas } = fetchFake(pages);
    const result = await runSource(fonte, { fetchPage });

    expect(visitadas).toHaveLength(3);

    const feira = result.events.find((event) => event.name === "Feira do Livro");
    expect(feira?.image.url).toBe("https://exemplo.com.br/wp-content/uploads/feira.jpg");
    expect(feira?.description).toContain("Praça da Alfândega");

    const show = result.events.find((event) => event.name === "Show na Praça");
    expect(show?.image.url).toBe("https://exemplo.com.br/foto-real.jpg");
    expect(show?.address).toContain("Praça Marechal Deodoro");
  });

  it("evento cuja página não abre entra assim mesmo, com o motivo registrado", async () => {
    const { fetchPage } = fetchFake({
      "https://exemplo.com.br/eventos/": LISTAGEM,
      "https://exemplo.com.br/eventos/show-na-praca/": DETALHE_JSONLD,
    });

    const result = await runSource(fonte, { fetchPage });

    expect(result.events.map((event) => event.name)).toContain("Feira do Livro");
    expect(result.skipped.some((item) => item.reason.startsWith("sem detalhe"))).toBe(true);
  });

  it("sem foto na fonte, fica sem foto — nada de imagem aleatória", async () => {
    const { fetchPage } = fetchFake({
      "https://exemplo.com.br/eventos/": `<a href="/eventos/sozinho/"><h3>Evento Pelado</h3></a>`,
      "https://exemplo.com.br/eventos/sozinho/": "<html><body></body></html>",
    });

    const result = await runSource(fonte, { fetchPage });
    expect(result.events[0]?.image.url).toBe("");
  });

  it("enrich desligado não abre página de detalhe nenhuma", async () => {
    const { fetchPage, visitadas } = fetchFake(pages);
    await runSource(fonte, { fetchPage, enrich: false });
    expect(visitadas).toEqual(["https://exemplo.com.br/eventos/"]);
  });

  it("respeita o teto de páginas de detalhe", async () => {
    const { fetchPage, visitadas } = fetchFake(pages);
    await runSource(fonte, { fetchPage, enrichLimit: 1 });
    expect(visitadas).toHaveLength(2);
  });

  it("não abre página de quem já veio completo da listagem", async () => {
    const completa: Source = {
      ...fonte,
      extract: () => [
        {
          name: "Já completo",
          url: "https://exemplo.com.br/eventos/completo/",
          description: "Tem texto",
          imageUrl: "https://exemplo.com.br/tem-foto.jpg",
        },
      ],
    };

    const { fetchPage, visitadas } = fetchFake({ "https://exemplo.com.br/eventos/": "" });
    await runSource(completa, { fetchPage });
    expect(visitadas).toEqual(["https://exemplo.com.br/eventos/"]);
  });
});
