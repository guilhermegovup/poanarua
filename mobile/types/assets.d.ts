/**
 * O alias "~/" resolve para arquivos reais, então o TypeScript precisa saber
 * como tipar as imagens importadas por ele (o expo/types só cobre os caminhos
 * relativos).
 */
declare module '~/assets/*.png' {
  const content: number;
  export default content;
}

declare module '~/assets/icons/*.png' {
  const content: number;
  export default content;
}
