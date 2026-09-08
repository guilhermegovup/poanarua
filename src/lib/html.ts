/**
 * As descrições dos eventos vêm em HTML do CMS antigo, com entidades e marcação
 * inconsistentes. Em vez de injetar isso direto no DOM, convertemos para blocos
 * simples que a UI renderiza como elementos React — sem `dangerouslySetInnerHTML`
 * e sem risco de script vindo do conteúdo.
 */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
  hearts: "♥",
  aacute: "á",
  agrave: "à",
  atilde: "ã",
  acirc: "â",
  eacute: "é",
  ecirc: "ê",
  iacute: "í",
  oacute: "ó",
  otilde: "õ",
  ocirc: "ô",
  uacute: "ú",
  uuml: "ü",
  ccedil: "ç",
  Aacute: "Á",
  Agrave: "À",
  Atilde: "Ã",
  Acirc: "Â",
  Eacute: "É",
  Ecirc: "Ê",
  Iacute: "Í",
  Oacute: "Ó",
  Otilde: "Õ",
  Ocirc: "Ô",
  Uacute: "Ú",
  Ccedil: "Ç",
};

export function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => ENTITIES[name] ?? match);
}

export interface HtmlSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

export interface HtmlBlock {
  segments: HtmlSegment[];
}

/**
 * Transforma o HTML em parágrafos com trechos formatados. Cobre o que o CMS
 * do Poa na Rua gera: <p>, <br>, <b>/<strong>, <i>/<em> e <a href>.
 */
export function parseHtml(html: string): HtmlBlock[] {
  if (!html) return [];

  const normalized = html
    .replace(/\r/g, "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<\s*p[^>]*>/gi, "")
    .replace(/<\/?\s*(div|section|article|span|ul|ol)[^>]*>/gi, "")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<\/\s*li\s*>/gi, "\n");

  const blocks: HtmlBlock[] = [];
  let segments: HtmlSegment[] = [];
  interface Style {
    bold: boolean;
    italic: boolean;
    href: string | null;
  }

  const base: Style = { bold: false, italic: false, href: null };
  const stack: Style[] = [base];
  const top = (): Style => stack[stack.length - 1] ?? base;

  const pushText = (raw: string) => {
    const style = top();
    const paragraphs = decodeEntities(raw).split(/\n{2,}/);

    paragraphs.forEach((paragraph, index) => {
      if (index > 0) {
        blocks.push({ segments });
        segments = [];
      }
      if (paragraph.length === 0) return;

      const segment: HtmlSegment = { text: paragraph };
      if (style.bold) segment.bold = true;
      if (style.italic) segment.italic = true;
      if (style.href) segment.href = style.href;
      segments.push(segment);
    });
  };

  const tagPattern = /<\/?([a-zA-Z0-9]+)([^>]*)>/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(normalized)) !== null) {
    pushText(normalized.slice(cursor, match.index));
    cursor = tagPattern.lastIndex;

    const [full, tagName = "", attributes = ""] = match;
    const tag = tagName.toLowerCase();
    const closing = full.startsWith("</");
    const current = top();

    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }

    if (tag === "b" || tag === "strong") {
      stack.push({ ...current, bold: true });
    } else if (tag === "i" || tag === "em") {
      stack.push({ ...current, italic: true });
    } else if (tag === "a") {
      const href = /href\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1] ?? null;
      stack.push({ ...current, href });
    }
  }

  pushText(normalized.slice(cursor));

  if (segments.length) blocks.push({ segments });

  return blocks.filter((block) => block.segments.some((segment) => segment.text.trim().length > 0));
}

/** Versão em texto puro, usada em buscas e prévias. */
export function htmlToPlainText(html: string): string {
  return parseHtml(html)
    .map((block) => block.segments.map((segment) => segment.text).join(""))
    .join("\n")
    .trim();
}
