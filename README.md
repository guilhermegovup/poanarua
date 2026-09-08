# Poa na Rua

Tudo que acontece em Porto Alegre — feiras, eventos de rua, shows, gastronomia e
parques. Todos os dias, em um só lugar.

Esta é a versão web do Poa na Rua, recriada a partir do aplicativo publicado na
Play Store (`com.guiipf.poanaruaoficial`, versão 2.7.1). A navegação, a copy, a
paleta e o contrato de API vieram do bundle do APK; a interface foi refeita para
a web, mobile-first, em TanStack Start + Tailwind + shadcn/ui.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://poanarua.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ab90ecb8-6ae0-4b7f-87e6-2b268abd7482).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Outros comandos: `npm run lint`, `npm test` (vitest, cobre o coletor) e
`npm run build`.

## O site

| Rota | O que é |
| --- | --- |
| `/` | Destaques, "Hoje Tem :)", categorias e o que vem por aí |
| `/evento/$id` | Página do evento: presença, favoritar, contatos, mapa, opiniões |
| `/categoria/$id` | Eventos de uma categoria |
| `/busca` | Busca por nome, endereço, descrição, tags e categoria |
| `/favoritos` | O que a pessoa salvou |
| `/perfil` | Sessão, meus eventos cadastrados |
| `/cadastrar-evento` | Cadastro aberto de eventos |
| `/sobre` | História do projeto e contatos |
| `/admin` | Webadmin: fila de revisão, publicar, ocultar, editar, excluir |
| `/admin/importar` | Roda o coletor e manda o que achou para a fila |
| `/admin/evento/novo` · `/admin/evento/$id` | Cadastro e edição |

### Alimentação automática

Um coletor visita fontes de agenda da cidade, extrai os eventos e coloca cada um
na **fila de revisão** — nada vai ao ar sem alguém aprovar no webadmin. Ele lê
`schema.org/Event` (JSON-LD) e feeds RSS/Atom, que é o que a maioria dos portais
publica, e roda no servidor para não esbarrar em CORS.

Somar uma fonte é criar um arquivo em `src/ingest/sources/`. Veja
[`docs/COLETOR.md`](docs/COLETOR.md).

### Dados

`src/data/api.ts` tem a mesma superfície da API original
(`poanarua.com.br/api`): `/events`, `/event/:id`, `/category`, `/tag`, `/flag`,
`/eventfavorite`, `/goevent`, `/evaluation`, `/gallery`, `/event_by_user`.

Como a API saiu do ar, por padrão tudo roda contra o dataset local de
`src/data/store.ts`, que guarda favoritos, presenças, opiniões e eventos
cadastrados no `localStorage`. Para voltar a falar com o backend real:

```sh
VITE_USE_MOCK=false npm run dev
```

Com o **Lovable Cloud** ligado, os dados vêm do Postgres e são compartilhados
entre todo mundo. O site escolhe a origem sozinho: existindo
`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, fala com o banco; sem
elas, cai no `localStorage` para o preview continuar navegável.

As migrations estão em `supabase/migrations/`, em ordem:

| Arquivo | O que cria |
| --- | --- |
| `0001_eventos.sql` | Tabelas, RLS, categorias e tags |
| `0002_profiles.sql` | Perfis públicos e as chaves que permitem aninhar o perfil nas consultas |

O RLS é a segurança de verdade: o público lê só evento publicado, escrever é de
quem está na tabela `admins`.

#### Virar administrador

Cadastre-se pelo site normalmente e depois rode, no SQL editor:

```sql
insert into admins (user_id)
select id from auth.users where email = 'seu@email.com';
```

Feito isso, aparece um atalho **Administrar eventos** na aba Perfil — visível só
para quem é admin. Nenhuma senha vive no código.

### PWA

O site é instalável: `public/manifest.webmanifest`, ícones gerados do vetor da
marca e um service worker próprio em `public/sw.js` — rede primeiro para
navegação (nunca serve HTML velho), cache primeiro para assets com hash e
imagens, e uma página `/offline` quando não há conexão. O `/admin` nunca é
cacheado. O service worker só registra em produção.

### Marca

O logo é o vetor original, servido de `public/logo-poa-na-rua.svg`. Os
arquivos-mestre (EPS e SVG) e os comandos de rasterização estão em
[`brand/`](brand/).

Os tokens de cor em `src/styles.css` saíram do app publicado — a cor primária
`#b32f4c` é o `COLOR_MAIN` do APK.

### De onde veio o conteúdo

[`docs/RECRIACAO.md`](docs/RECRIACAO.md) registra o que foi extraído do APK
(navegação, textos, paleta, modelos de dados, contrato de API) e onde cada parte
foi parar no código.

### O que ficou de fora

- **Login social** (Facebook, Google, Apple): precisa de chaves de projeto
  próprias. Ficou só o e-mail, com sessão local.
- **Push e analytics**: eram Firebase no app nativo; aqui não há equivalente.
- **Upload de imagem**: o cadastro aceita link de imagem em vez de upload,
  porque não existe backend de arquivos no ar.
- **Sem banco, `/admin` não tem login**: rodando só com `localStorage` não há o
  que proteger nem como. Com o Lovable Cloud ligado, a proteção é o RLS.
- **Galeria de fotos do evento**: as tabelas existem, a tela ainda não.
