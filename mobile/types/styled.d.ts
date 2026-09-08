import 'styled-components/native';

import { COLORS } from '~/styles/colors';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: typeof COLORS;
  }
}
