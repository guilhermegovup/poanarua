# Marca

Arquivos-mestre do logo do Poa na Rua.

- `Logo_Poa_na_Rua.eps` — vetor original (Affinity, 340×340 pt). É a fonte de
  verdade; qualquer novo tamanho sai daqui.
- `logo.svg` — o mesmo vetor em SVG, para uso em web e ferramentas de design.

Os PNGs do app (`src/assets/logo.png`, `src/assets/logo_poa.png` e os ícones em
`assets/`) são rasterizados a partir do EPS:

```sh
# logo transparente, em qualquer tamanho (dpi = tamanho / 340 * 72)
gs -q -dNOPAUSE -dBATCH -dEPSCrop -sDEVICE=pngalpha \
   -dTextAlphaBits=4 -dGraphicsAlphaBits=4 \
   -r216.847 -sOutputFile=logo_1024.png Logo_Poa_na_Rua.eps

# ícone iOS: sem canal alpha, fundo branco
gs -q -dNOPAUSE -dBATCH -dEPSCrop -sDEVICE=png16m \
   -dTextAlphaBits=4 -dGraphicsAlphaBits=4 \
   -r216.847 -sOutputFile=icon.png Logo_Poa_na_Rua.eps

# ícone adaptativo Android: logo a 62% num canvas 1024, com margem de segurança
gs -q -dNOPAUSE -dBATCH -sDEVICE=pngalpha \
   -dTextAlphaBits=4 -dGraphicsAlphaBits=4 \
   -g1024x1024 -r134.4 -sOutputFile=adaptive-icon.png \
   -c "103 103 translate" -f Logo_Poa_na_Rua.eps
```

## Cores do vetor

| Papel | Hex |
| --- | --- |
| Vinho | `#b90054` |
| Rosa | `#df2a58` |
| Laranja | `#f37422` |
| Amarelo escuro | `#f9a31c` / `#f9a925` |
| Amarelo | `#fdb211` / `#ffcd3d` |
| Branco | `#fffeff` |

O `COLOR_MAIN` da interface (`#b32f4c`, em `src/styles/colors.ts`) vem do bundle
do APK e é ligeiramente diferente do vinho do logo — foi mantido como estava no
app publicado.
