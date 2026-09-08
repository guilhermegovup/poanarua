# Poa na Rua

Recriação do aplicativo **Poa na Rua** (`com.guiipf.poanaruaoficial`, versão 2.7.1,
`versionCode` 27001) a partir do APK publicado na Play Store.

O app original era um React Native 0.6x com `react-navigation` 4, NativeBase,
`styled-components` e Firebase. Esta versão reconstrói o mesmo produto — telas,
fluxos, textos, paleta e contrato de API — em **Expo SDK 57 + React Native 0.86 +
TypeScript**, com `react-navigation` 7.

O que o app faz: mostra tudo que acontece na rua em Porto Alegre — feiras,
eventos, shows, gastronomia — com destaques do dia, busca, favoritos, "eu vou",
opiniões, galeria colaborativa, rotas e cadastro de eventos pela própria comunidade.

> Este projeto vive em `mobile/` dentro do repositório. A raiz continua sendo o
> projeto web sincronizado com o Lovable — os dois não se misturam.

## Rodando

```bash
cd mobile
npm install
npm start          # abre o Metro; leia o QR code com o Expo Go
npm run android
npm run ios
npm run typecheck
```

Por padrão o app sobe com **dados locais** (`EXPO_PUBLIC_USE_MOCK` diferente de
`false`), então funciona sem backend nenhum. Para falar com a API de verdade:

```bash
EXPO_PUBLIC_USE_MOCK=false npm start
```

> As telas de mapa (`Maps` e o card do evento) usam `react-native-maps`. Se o
> Expo Go da tua versão não trouxer o módulo nativo, roda com um development
> build (`npx expo run:android`) para vê-las.

## Estrutura

```
src/
  assets/           imagens extraídas do APK (logo, fundo do login, ícones)
  components/
    event/          blocos da tela de evento (GoEvent, Gallery, Opinion, CardMap...)
    home/           carrossel, "Hoje Tem" e grade de categorias
    shared/         shimmer, avatar, header, aviso de login, renderer de HTML
  config/           BASE_URL, token, chave do modo mock, contatos oficiais
  navigation/       stack raiz + bottom tabs (Home / Perfil)
  screens/          as 23 telas do app
  services/         mesma superfície da API original
    mock/           backend local (adapter do axios + estado em AsyncStorage)
  storage/          wrapper do AsyncStorage com as chaves originais (@logged_user, @token...)
  styles/           COLORS e DIMENSIONS extraídos do bundle
  types/            modelos de dados da API
  utils/            sessão, distância, HTML, links, validadores, datas
```

## Navegação

Reproduz a árvore do app original, achatada num stack só:

| Origem no APK | Telas |
| --- | --- |
| `SwitchNavigator` | `Splash` → `Login` / `UpdateApp` / `Main` |
| Stack de login | `Login`, `LoginWithEmail`, `RegisterUser`, `RecoverPassword` |
| Tabs | `Home`, `Perfil` |
| Stack interno | `CategoryList`, `DescriptionEvent`, `About`, `Edit`, `FavoritesEvents`, `MyEvents`, `RegisterEvent`, `OpenLinks` |
| Stack modal | `Search`, `SendOpinion`, `Maps`, `CategoriesByRegister`, `ContactsByRegister`, `CallShowRoutes`, `Photos`, `InAppMessage` |

## API

`src/services` mantém exatamente os endpoints que o app 2.7.1 chamava em
`https://poanarua.com.br/api`:

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/events` | listagem da home |
| GET | `/event/:id` | detalhe do evento |
| GET | `/event_by_user` | meus eventos cadastrados |
| POST/PUT/DELETE | `/event`, `/event/:id` | cadastro, edição e exclusão |
| GET | `/category`, `/tag`, `/flag` | catálogos |
| GET/PUT | `/eventfavorite/...` | favoritos |
| GET/PUT | `/goevent/...` | "eu vou" |
| GET/POST | `/evaluation/...` | opiniões |
| GET/POST/DELETE | `/gallery/...` | galeria do evento |
| POST | `/sessions`, `/users`, `/files` | login, cadastro e upload |
| PUT | `/users/:id` | edição de perfil |
| GET | `/update`, `/inappmessage` | versão mínima e comunicado in-app |

Trocar `USE_MOCK` para `false` faz o `axios` voltar a falar com o servidor real;
nada mais precisa mudar nas telas.

## Diferenças em relação ao APK original

Estão documentadas em [`docs/RECRIACAO.md`](docs/RECRIACAO.md), junto com o
método de engenharia reversa usado para extrair navegação, telas, textos, cores
e contrato de API do bundle JavaScript do APK.

Em resumo:

- **Login social desativado.** Facebook, Google e Apple Sign-In exigem chaves
  próprias de projeto; ficaram fora e o app entra por e-mail ou pelo modo
  "Conhecer o APP".
- **Firebase fora.** Analytics, Crashlytics, push e CodePush viraram um ponto
  único em `src/utils/metrics.ts`, pronto para plugar o SDK escolhido.
- **Descrição em HTML sem WebView.** O CMS manda HTML; um parser próprio
  (`src/utils/html.ts`) converte em `<Text>` nativo, com links clicáveis.
- **Dados de exemplo.** O dataset local traz feiras e eventos reais de Porto
  Alegre (Brique da Redenção, Feira Me Gusta, Gasômetro...) com imagens de
  placeholder.
