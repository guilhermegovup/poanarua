# Como o app foi recriado a partir do APK

Registro do que foi extraído de `33ed3ceb-27001.apk` e como cada parte virou
código neste repositório.

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
Facebook SDK, Google Sign-In e Apple Authentication.

## 2. Navegação

O módulo de rotas do bundle descrevia a árvore completa. Reproduzida na íntegra:

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

`ShowAnywhere` era só um invólucro genérico de modal (recebia um elemento React
por parâmetro) e não tem equivalente aqui — o stack modal do `react-navigation` 7
cobre o mesmo caso.

## 3. Identidade visual

A paleta veio literal do módulo de constantes e está em `src/styles/colors.ts`
com os mesmos nomes. A cor de marca é `COLOR_MAIN: #b32f4c`.

As imagens do app foram recuperadas de `res/drawable-*` (o Metro renomeia
`src/assets/logo.png` para `src_assets_logo.png` no build) e estão em
`src/assets`: `login_background`, `image_profile`, `nav_maps`, `nav_waze`,
`applemaps` e os quatro ícones de contato do "Sobre".

O logo é a exceção: o APK só trazia PNG rasterizado e desfocado, então ele foi
substituído pelo vetor original da marca (`src/assets/brand/Logo_Poa_na_Rua.eps`).
Todos os PNGs de logo e os ícones do app são gerados a partir dele — veja
`src/assets/brand/README.md` para os comandos e a paleta do vetor.

Medidas de layout (alturas dos cards, raios, espaçamentos) foram lidas dos
`styled-components` do bundle e reproduzidas: carrossel de 400px, cards do
"Hoje Tem" de 120×140 com borda laranja quando destacados, grade de categorias
em 2 colunas de 110px.

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
`src/services`, com os mesmos verbos, caminhos e corpos de requisição.

As chaves de AsyncStorage também foram mantidas (`@logged_user`, `@token`,
`@tokenFirebase`, `@tokenFacebook`, `@currentTime`, `@location`), então uma
instalação antiga continuaria legível.

O formato dos objetos (`EventItem`, `Category`, `Evaluation`, `GoEventUser`,
`Contact`, `Flag`, `EventLocation`) foi tirado do dataset de exemplo que o
próprio APK carregava embutido, e está em `src/types/index.ts`.

## 6. Backend local

Como `poanarua.com.br/api` não responde mais, `src/services/mock` implementa um
backend completo:

- `db.ts` — dataset com 9 eventos reais de Porto Alegre, 6 categorias, 8 tags e
  4 flags, nas mesmas estruturas da API.
- `adapter.ts` — adapter do `axios` que resolve as rotas originais.
- `state.ts` — estado mutável em AsyncStorage: favoritos, "eu vou", opiniões,
  galeria, eventos cadastrados e usuários sobrevivem ao reload.

Uma latência artificial de ~320ms mantém os shimmers de carregamento visíveis,
como no app original.

## 7. Decisões conscientes de divergência

| Original | Aqui | Motivo |
| --- | --- | --- |
| Facebook / Google / Apple Sign-In | apenas e-mail + modo anônimo | exigem chaves de projeto e configuração nativa próprias |
| Firebase Analytics / Crashlytics / Messaging | `src/utils/metrics.ts` | ponto único para plugar o SDK que o projeto escolher |
| CodePush | — | descontinuado; Expo Updates cobre o caso |
| `react-native-render-html` para a descrição | parser próprio em `src/utils/html.ts` | evita uma dependência frágil e renderiza `<Text>` nativo |
| NativeBase + `react-native-paper` | `StyleSheet` + `@expo/vector-icons` | NativeBase 2 não roda em RN 0.86 |
| `moment` | `dayjs` | mesma API, bem menor |
| `formik` + `yup` | validação direta nas telas | os formulários são pequenos e a validação original era simples |
| DatePicker nativo | campo com máscara `DD/MM/AAAA` | menos superfície nativa, mesmo resultado |

## 8. Verificação

```bash
npm run typecheck                      # tsc --noEmit, sem erros
npx expo export --platform android     # bundle gerado com sucesso
npx expo export --platform ios         # bundle gerado com sucesso
```

Os bundles compilam para as duas plataformas. O app **não foi executado em
device ou emulador** nesta recriação — o comportamento em runtime (permissões,
mapas, image picker) ainda precisa de um teste no aparelho.
