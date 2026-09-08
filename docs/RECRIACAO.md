# Como o site foi recriado a partir do APK

O Poa na Rua existiu como aplicativo Android (`com.guiipf.poanaruaoficial`)
antes de virar este site. Boa parte do que está aqui — navegação, textos,
paleta, modelos de dados e contrato de API — foi recuperada do APK publicado
na Play Store, não reinventada.

Este documento registra o que foi extraído de `33ed3ceb-27001.apk` e onde cada
parte foi parar no código.

## 1. O que o APK entregava

```
package     com.guiipf.poanaruaoficial
versionName 2.7.1
versionCode 27001
build       Mon Nov 29 09:25:46 BRT 2021
```

O APK trazia `assets/index.android.bundle` como **JavaScript puro** (não
compilado para bytecode Hermes), o que permitiu ler o código do app inteiro.
Foram 1.734 módulos Metro; os do app foram separados dos de biblioteca pelo
grafo de dependências a partir do módulo raiz de rotas.

Bibliotecas identificadas no bundle: `react-navigation` 4 (+ stack e
material-bottom-tabs), NativeBase, `react-native-paper`, `styled-components`,
`axios`, `formik` + `yup`, `moment`, `lodash`, `react-native-maps`,
`react-native-webview`, `react-native-image-picker`, `react-native-share`,
`react-native-code-push`, Firebase (Analytics, Auth, Messaging, Crashlytics),
Facebook SDK, Google Sign-In e Apple Authentication. Nenhuma delas entrou no
site — o que foi aproveitado é o conteúdo e o desenho do produto, não o código.

## 2. Navegação

O módulo de rotas do bundle descrevia a árvore completa das 23 telas:

```
SwitchNavigator (initialRouteName: 'Splash')
├── Splash
├── RoutesLogin  → Login, RegisterUser, LoginWithEmail, RecoverPassword
├── UpdateApp
└── App (stack modal, headerMode none)
    ├── App (stack) → Main, CategoryList, DescriptionEvent, About, Edit,
    │                 OpenLinks, FavoritesEvents, MyEvents, RegisterEvent,
    │                 RegisterUser, LoginWithEmail
    ├── ShowAnywhere        ├── CallShowRoutes   ├── SendOpinion
    ├── Search              ├── DescriptionEvent ├── InAppMessage
    ├── Photos              ├── Maps             ├── CategoriesByRegister
    └── ContactsByRegister

Main = materialBottomTabNavigator { Home, Perfil }
```

No site isso vira 8 rotas: as telas que existiam só por limitação de tela de
celular (seletores de categoria e de contato, escolha de app de navegação,
modal de rotas) viraram partes da própria página, e as telas de fluxo de conta
(splash, login social, recuperação de senha, atualização de app) não têm razão
de existir na web.

## 3. Identidade visual

A paleta veio literal do módulo de constantes do bundle. Os tokens estão em
`src/styles.css` como `--brand-*`, e a cor de marca (`COLOR_MAIN: #b32f4c`) é a
primária da interface.

O logo do APK era um PNG rasterizado e desfocado, então foi substituído pelo
vetor original da marca, que vive em `brand/` e é servido ao site como
`public/logo-poa-na-rua.svg`. Veja `brand/README.md` para os comandos de
rasterização e a paleta do vetor.

As medidas de layout do app (carrossel de 400px, cards de 120×140 com borda
laranja quando destacados, grade de categorias em 2 colunas) serviram de
referência, mas o site tem layout próprio: mobile-first, com breakpoints para
tablet e desktop, em vez de reproduzir a tela do celular.

## 4. Textos

Toda a copy em português veio dos literais do bundle, sem reescrita: as seções
da home ("Hoje Tem :)", "Bora curtir POA?", "Novidades por aqui:", "Olá, ;)"),
o texto institucional completo do "Sobre", as mensagens de validação de
formulário, o aviso "Para acessar esse recurso, é necessário estar logado.",
a tela de atualização obrigatória e os rótulos de cadastro de evento.

## 5. Contrato de API

`BASE_URL('DEV')` no bundle apontava para `https://poanarua.com.br/api`, com
`Authorization` injetado por interceptor a partir do token em AsyncStorage.
Todos os endpoints estão listados no README e reimplementados em
`src/data/api.ts`, com os mesmos verbos e caminhos.

O formato dos objetos (`EventItem`, `Category`, `Evaluation`, `GoEventUser`,
`Contact`, `Flag`, `EventLocation`) foi tirado do dataset de exemplo que o
próprio APK carregava embutido, e está em `src/data/types.ts`.

A URL de compartilhamento do app era `poanarua.com.br/#/evento/:id`; o site usa
`/evento/:id`, então os links antigos continuam apontando para o evento certo.

## 6. Backend local

Como `poanarua.com.br/api` não responde mais, o site traz o seu próprio
backend local:

- `src/data/seed.ts` — dataset com eventos reais de Porto Alegre, 6 categorias,
  8 tags e 4 flags, nas mesmas estruturas da API.
- `src/data/store.ts` — estado mutável em `localStorage`: favoritos, "eu vou",
  opiniões, galeria, eventos cadastrados e sessão sobrevivem ao reload.
- `src/data/api.ts` — decide entre o store local e a API real conforme
  `VITE_USE_MOCK`.

Uma latência artificial curta mantém os skeletons de carregamento visíveis,
como os shimmers do app original.

## 7. Decisões conscientes de divergência

| Original (app Android) | Aqui (site) | Motivo |
| --- | --- | --- |
| Facebook / Google / Apple Sign-In | apenas e-mail, com sessão local | exigem chaves de projeto próprias |
| Firebase Analytics / Crashlytics / Messaging | — | não há equivalente no site |
| CodePush | — | descontinuado; o deploy do site cobre o caso |
| `react-native-render-html` para a descrição | parser próprio em `src/lib/html.ts` | converte o HTML do CMS em elementos React, sem `dangerouslySetInnerHTML` |
| NativeBase + `react-native-paper` | Tailwind + shadcn/ui | é o design system que este projeto já usava |
| `react-native-maps` | embed do OpenStreetMap | não exige chave de API |
| Upload de imagem no cadastro | campo de link | não há backend de arquivos no ar |
| DatePicker nativo | `<input type="date">` | o próprio navegador resolve |

## 8. Verificação

```bash
npx tsc --noEmit    # sem erros
npm run lint        # sem erros
npm run build       # passa
```

Além disso, as páginas foram abertas em navegador real (Chromium via
Playwright) em viewport de celular e de desktop, o que pegou problemas que o
build não pega — contraste, transbordo de texto e dados de exemplo indevidos
nas listagens.
