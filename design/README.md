# Capas das categorias

As nove capas do trilho "Bora curtir POA?", desenhadas na paleta da marca.

## Por que desenho e não foto

Foto de banco de imagens em capa de categoria envelhece mal e não é da cidade.
Desenho na paleta faz as nove lerem como um conjunto, e cada arquivo tem cerca
de 1 KB — SVG não perde nitidez em tela nenhuma.

## O que manda na composição

A capa é vista a **192×128** com um degradê escuro por cima e o nome em branco
por baixo. Então:

- o assunto fica na **metade de cima** — a de baixo some sob o degradê;
- as formas são **grandes e chapadas**, sem detalhe fino que suma nesse tamanho;
- cada capa tem um fundo diferente do vizinho no trilho, para a faixa não virar
  uma mancha só.

## Os arquivos

| Fonte | Vai para | Categoria |
| --- | --- | --- |
| `Criancas.dc.html` | `public/categorias/criancas.svg` | PARA CRIANÇAS |
| `FeirasOrganicas.dc.html` | `public/categorias/feiras-organicas.svg` | FEIRAS ORGÂNICAS E ECOLÓGICAS |
| `Artesanato.dc.html` | `public/categorias/artesanato.svg` | ARTESANATO E BRECHÓ |
| `EventosDeRua.dc.html` | `public/categorias/eventos-de-rua.svg` | EVENTOS DE RUA |
| `Musica.dc.html` | `public/categorias/musica.svg` | MÚSICA E SHOWS |
| `Gastronomia.dc.html` | `public/categorias/gastronomia.svg` | GASTRONOMIA |
| `PontosTuristicos.dc.html` | `public/categorias/pontos-turisticos.svg` | PONTOS TURÍSTICOS |
| `ParquesEPracas.dc.html` | `public/categorias/parques-e-pracas.svg` | PARQUES E PRAÇAS |
| `ArteCultura.dc.html` | `public/categorias/arte-e-cultura.svg` | ARTE E CULTURA |

`Main.dc.html` é só o trilho montado no tamanho real, para conferir.

## Mexer numa capa

1. Edite o SVG dentro de `gen.py` (a paleta está no topo do arquivo).
2. `python3 gen.py` regenera os `.dc.html`.
3. `python3 preview.py` monta `preview.html` — abra no navegador: mostra as nove
   nos dois tamanhos, com o degradê e o rótulo reais.
4. Quando estiver bom, reexporte para `public/categorias/` (o trecho de extração
   está no histórico do commit que criou as capas).

## No banco

`supabase/migrations/0003_capas_categorias.sql` aponta `categories.image_url`
para os caminhos acima. Caminho relativo de propósito: o site serve os arquivos,
então trocar de domínio não quebra nada.
