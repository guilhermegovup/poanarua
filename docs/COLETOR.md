# Coletor de eventos

O Poa na Rua se alimenta sozinho: um coletor visita fontes de agenda da cidade,
extrai os eventos e coloca cada um na **fila de revisão** do webadmin. Nada
entra no site sem alguém aprovar.

## Como funciona

```
fonte  →  extrair  →  normalizar  →  deduplicar  →  fila de revisão  →  publicar
```

| Etapa      | Onde                       | O que faz                                           |
| ---------- | -------------------------- | --------------------------------------------------- |
| Extrair    | `src/ingest/extract.ts`    | Lê JSON-LD `schema.org/Event` e feeds RSS/Atom      |
| Fonte      | `src/ingest/sources/`      | Pontos de entrada e, se preciso, seletores próprios |
| Gerar      | `src/ingest/recurrence.ts` | Expande a agenda fixa da cidade em datas reais      |
| Normalizar | `src/ingest/normalize.ts`  | Datas em pt-BR, horários, categorias e tags         |
| Deduplicar | `src/ingest/normalize.ts`  | `dedupe_key` = nome enxuto + dia                    |
| Orquestrar | `src/ingest/run.ts`        | Percorre as fontes, tolera página fora do ar        |
| Executar   | `src/ingest/server.ts`     | Server function — roda no servidor, não no browser  |

### Por que JSON-LD e RSS primeiro

Portais de turismo e agendas culturais publicam `schema.org/Event` para
aparecer no Google, e quase todo WordPress expõe RSS. Os dois são padrões: não
quebram quando o site muda de tema, e o mesmo código serve para qualquer fonte
nova. Seletor de HTML é o último recurso, fica isolado em `sources/` e é onde a
manutenção dói.

### Por que roda no servidor

Buscar as fontes pelo navegador esbarraria em CORS — nenhum portal libera
leitura cross-origin — e faria a requisição sair como se fosse a pessoa
navegando. No servidor o `fetch` é direto e o `User-Agent` identifica o robô:

```
PoaNaRuaBot/1.0 (+https://poanarua.com.br)
```

## Rodar

Pelo webadmin, em **Admin → Importar → Buscar eventos agora**. O botão só
**mostra** o que encontrou — nada é gravado até "Mandar tudo para revisão".

## Agenda fixa: o que nenhuma fonte publica

O Brique da Redenção acontece **todo domingo desde 1978** e a Feira Ecológica
**todo sábado desde 1989**. Justamente por serem fixos, não viram notícia: não
aparecem em agenda nenhuma. Sem tratá-los à parte, um sábado de manhã na
plataforma fica vazio mesmo com todos os coletores funcionando.

`sources/agenda-fixa.ts` é uma fonte que **não baixa nada — ela gera**. Cada
entrada do catálogo tem uma regra de recorrência, e o coletor a expande nas
próximas três semanas.

Cada data vira um evento datado, com `dedupe_key` própria. Isso significa que:

- rodar a coleta duas vezes não duplica nada;
- o webadmin edita **cada domingo separadamente** — dá para cancelar o Brique
  de um feriado específico sem mexer na regra;
- as ocorrências entram na fila de revisão como qualquer outra, então nada é
  publicado sem alguém olhar.

### Somar uma feira

Acrescente um objeto em `AGENDA_FIXA`:

```ts
{
  name: "Feira do Meu Bairro",
  description: "<p>...</p>",
  address: "Praça Tal - Bairro, Porto Alegre",
  hour: "08:00-13:00",
  startHour: "08:00",
  latitude: "-30.0000",
  longitude: "-51.0000",
  keywords: ["feira", "orgânico", "ar livre"],
  offers: "Gratuito",
  recurrence: { kind: "semanal", weekdays: [6] }, // 0 = domingo
}
```

Regras disponíveis:

| Regra     | Exemplo                                          | Significa            |
| --------- | ------------------------------------------------ | -------------------- |
| `semanal` | `{ kind: "semanal", weekdays: [0] }`             | Todo domingo         |
| `semanal` | `{ kind: "semanal", weekdays: [3, 6] }`          | Toda quarta e sábado |
| `mensal`  | `{ kind: "mensal", weekdays: [6], nth: [1, 3] }` | 1º e 3º sábado       |
| `mensal`  | `{ kind: "mensal", weekdays: [5], nth: [-1] }`   | Última sexta         |

**Confirme dia e horário antes de somar.** O catálogo só tem o que é
tradicional e estável; quem chega numa feira que não existe não volta. As
coordenadas são aproximadas — o pino se ajusta no webadmin.

### Fuso

Tudo é calculado no dia de calendário de Porto Alegre (UTC−03:00, sem horário
de verão desde 2019) e o instante sai carimbado com o fuso explícito
(`2026-09-13T09:00:00-03:00`). Sem isso, 9h do Brique viraria 9h do servidor
onde a coleta rodou.

## Somar uma fonte

Crie `src/ingest/sources/minha-fonte.ts`:

```ts
import { extractStandard } from "../extract";
import type { Source } from "../types";

export const minhaFonte: Source = {
  id: "minha-fonte",
  name: "Minha Fonte",
  homepage: "https://exemplo.com.br",
  entrypoints: ["https://exemplo.com.br/agenda/", "https://exemplo.com.br/feed/"],
  extract: extractStandard,
};
```

E registre em `src/ingest/sources/index.ts`. Se a fonte não tiver JSON-LD nem
feed, escreva um `extract` próprio — use `sources/destino-poa.ts` como exemplo.

## Ajustar uma fonte que parou de trazer

A tela de importação mostra, por fonte, quantos vieram, quantos eram repetidos
e o que foi descartado com o motivo. Uma fonte que devolve zero e lista
`falha ao baixar: HTTP 404` mudou os endereços — é só corrigir `entrypoints`.

## Destino POA

Os `entrypoints` e os seletores de HTML de `sources/destino-poa.ts` foram
escritos a partir dos padrões que portais de turismo costumam usar, mas **não
foram conferidos contra o site no ar**: o ambiente onde o coletor foi escrito
não alcança o domínio. Na primeira execução, confira o que aparece na tela de
importação antes de mandar para a fila.

## Conteúdo de terceiros

O coletor guarda a origem de cada evento (`source_name`, `source_url`) e o
webadmin mostra o link para o original. Textos e fotos continuam sendo de quem
publicou: o combinado é usar a fonte como pista e dar o crédito, não espelhar o
site alheio. Se uma fonte pedir para sair, é só removê-la de
`sources/index.ts`.

## Inferência de categoria

`normalize.ts` chuta a categoria por palavra-chave — "criança", "infantil" e
"contação de história" levam para **PARA CRIANÇAS**; "orgânico" e "agroecológico"
para **FEIRAS ORGÂNICAS E ECOLÓGICAS**, e assim por diante. Erra às vezes, e é
justamente por isso que nada publica sozinho: a fila de revisão existe para
corrigir antes de ir ao ar.
