# O PWA

O Poa na Rua é usado na rua: celular na mão, sinal ruim, decidindo o que fazer
agora. O que segue existe por causa disso.

## O que estava faltando

O service worker cacheava HTML, JS e imagens. Mas os eventos vêm do Supabase,
que é **outra origem** — e o código só cacheava imagens de terceiros. Sem sinal,
o app abria, rodava a consulta, falhava e mostrava "não consegui carregar".

Instalava, e offline não servia para nada.

## Programação guardada

`src/lib/offline-cache.ts` guarda o cache do TanStack Query no IndexedDB e o
devolve na abertura seguinte. O que voltou é tratado como dado velho: aparece na
hora e revalida contra a rede, então online ninguém vê programação de ontem.

- **IndexedDB, não localStorage.** localStorage é síncrono, trava a thread da
  interface e tem limite apertado para dezenas de eventos com descrição.
- **Só consulta bem-sucedida, e nada do webadmin.** A fila de revisão de quem
  administra não tem por que morar no aparelho de quem quer ver o sábado.
- **Sete dias.** Depois disso a programação guardada é velha demais para valer.
- **Escrita atrasada em 1s.** Salvar a cada mudança do cache seria salvar a cada
  tecla digitada na busca.
- **Falha em silêncio.** Aba anônima, cota estourada, aparelho sem IndexedDB: o
  app funciona igual, só sem a parte offline.

E uma faixa avisa que o que está na tela é do último carregamento. Mostrar
evento de ontem sem dizer nada seria pior que mostrar nada.

## Convite para instalar

Não existia nenhum. No Android o Chrome mostra uma barrinha discreta; **no
iPhone não aparece nada** — instalar é Compartilhar → Adicionar à Tela de
Início, e sem instrução escrita ninguém descobre.

`src/lib/install-prompt.ts` guarda o `beforeinstallprompt` do Android para
disparar num botão nosso, e detecta iPhone para mostrar a instrução no lugar.

- **A partir da segunda visita.** Convite na primeira abertura é propaganda; na
  segunda é oferta.
- **Trinta dias de silêncio** depois de um "agora não".
- **Nunca para quem já instalou** (`display-mode: standalone`, e a propriedade
  própria do Safari, que não implementa isso).

## Versão do cache

`VERSION` estava fixa em `"v1"`. Como a limpeza do `activate` só apaga cache de
nome diferente e o nome nunca mudava, **cada deploy empilhava mais JS com hash
novo no mesmo cache e nada saía**. Em um ano, lixo acumulado no aparelho.

Agora a página registra `/sw.js?v=<id do build>` e o worker lê a versão da
própria URL. O mesmo parâmetro resolve as duas coisas: o navegador compara a URL
do worker para decidir se há versão nova, e o worker nomeia os caches com ela.

O id sai do `define` em `vite.config.ts`, carimbado a cada build.

## Aviso de versão nova

O worker já escutava a mensagem `skip-waiting`, mas nada no app a enviava — era
código morto. Agora, quando existe versão nova esperando, aparece um aviso com
"Atualizar". É convite, não interrupção: quem está lendo um evento não deve ter
a página recarregada por baixo.

## Recortes na URL

`/?filtro=hoje,gratis`. Antes o estado era local, e por isso:

- os atalhos do manifest apontavam todos para `/` — atalho que não atalhava
  nada;
- não dava para mandar no grupo "olha o que tem de graça esse fim de semana",
  só o link do site.

É texto separado por vírgula, não array: o roteador serializaria um array como
`?filtro=["hoje","amanha"]`. Recorte desconhecido é descartado — um link antigo
abre a home, não uma tela de erro.

## Manifest

Ganhou `screenshots` (o Android mostra o cartão com imagem em vez do convite
simples), `display_override` e os quatro atalhos apontando para filtros de
verdade.

Os screenshots saem do app rodando, em 390×844 e 1280×800.

## O que ainda não tem

**Notificações push** — "sábado, 7h, a feira ecológica abriu" é o que traz a
pessoa de volta. Pede backend para guardar as inscrições e enviar, e no iPhone
só funciona depois que a pessoa instalou.
