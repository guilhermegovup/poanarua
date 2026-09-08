# Poá Na Rua

cria um projeto em branco chamado poa na rua

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

## App mobile

O aplicativo nativo do Poa na Rua — recriado a partir do APK 2.7.1 publicado na
Play Store — vive em [`mobile/`](mobile/), em Expo + React Native + TypeScript,
com ciclo de vida próprio (`cd mobile && npm install && npm start`).

Ele não interfere neste projeto web: a raiz continua sendo o projeto do Lovable.
Veja [`mobile/README.md`](mobile/README.md) e
[`mobile/docs/RECRIACAO.md`](mobile/docs/RECRIACAO.md).
