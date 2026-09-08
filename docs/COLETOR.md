# Coletor de eventos

O Poa na Rua se alimenta sozinho: um coletor visita fontes de agenda da cidade,
extrai os eventos e coloca cada um na **fila de revisão** do webadmin. Nada
entra no site sem alguém aprovar.

## Como funciona

```
fonte  →  extrair  →  normalizar  →  deduplicar  →  fila de revisão  →  publicar
```

| Etapa | Onde | O que faz |
| --- | --- | --- |
| Extrair | `src/ingest/extract.ts` | Lê JSON-LD `schema.org/Event` e feeds RSS/Atom |
| Fonte | `src/ingest/sources/` | Pontos de entrada e, se preciso, seletores próprios |
| Normalizar | `src/ingest/normalize.ts` | Datas em pt-BR, horários, categorias e tags |
| Deduplicar | `src/ingest/normalize.ts` | `dedupe_key` = nome enxuto + dia |
| Orquestrar | `src/ingest/run.ts` | Percorre as fontes, tolera página fora do ar |
| Executar | `src/ingest/server.ts` | Server function — roda no servidor, não no browser |

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

Pelo webadmin, em **Admin → Importar → Buscar eventos agora**.

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
