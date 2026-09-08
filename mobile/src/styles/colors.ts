/**
 * Paleta original do Poa na Rua, mantida com os mesmos nomes usados no app 2.7.1.
 */
export const COLORS = {
  COLOR_MAIN: '#b32f4c',
  WHITE: '#FFFFFF',
  BORDER_GRAY: '#E5E5E5',
  GRAY: '#AFB6BB',
  LIGHT_GRAY: '#F6F7F9',
  BLUE: '#1639a5',
  PINK: '#FF8A98',
  GREEN: '#6FEB43',
  BLACK: '#000000',
  BLUE_FACEBOOK: '#3B5998',
  RED_GOOGLE: '#D6492F',
  PURPLE_INSTAGRAM: '#990EDA',
  ORANGE: '#EC8A3C',
  TRANSPARENT: '#00000000',
  YELLOW: '#FFC000',
  LIGHT_BLUE: '#3395ff',
  SEARCH_BACKGROUND: '#EFF0F1',
  TRANSPARENT_70: '#00000090',
  TRANSPARENT_50: '#00000099',
} as const;

export type Colors = typeof COLORS;
