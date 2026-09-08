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

### Marca

O logo é o vetor original da marca, servido de `public/logo-poa-na-rua.svg`. Os
tokens de cor em `src/styles.css` saíram do app publicado — a cor primária
`#b32f4c` é o `COLOR_MAIN` do APK.

### O que ficou de fora

- **Login social** (Facebook, Google, Apple): precisa de chaves de projeto
  próprias. Ficou só o e-mail, com sessão local.
- **Push e analytics**: eram Firebase no app nativo; aqui não há equivalente.
- **Upload de imagem**: o cadastro aceita link de imagem em vez de upload,
  porque não existe backend de arquivos no ar.

## App mobile

O aplicativo nativo do Poa na Rua — recriado a partir do APK 2.7.1 publicado na
Play Store — vive em [`mobile/`](mobile/), em Expo + React Native + TypeScript,
com ciclo de vida próprio (`cd mobile && npm install && npm start`).

Ele não interfere neste projeto web: a raiz continua sendo o projeto do Lovable.
Veja [`mobile/README.md`](mobile/README.md) e
[`mobile/docs/RECRIACAO.md`](mobile/docs/RECRIACAO.md).
