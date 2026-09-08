import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

import { COLORS } from '~/styles';

interface Props {
  style?: StyleProp<ViewStyle>;
  /** Quando `true` o conteúdo real já chegou e o placeholder some. */
  visible?: boolean;
  children?: React.ReactNode;
}

/** Placeholder pulsante usado enquanto a home e o evento carregam. */
export function Shimmer({ style, visible = false, children }: Props) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (visible) return undefined;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity, visible]);

  if (visible) return <>{children}</>;

  return (
    <Animated.View
      style={[{ backgroundColor: COLORS.BORDER_GRAY, opacity }, style]}
    />
  );
}

export default Shimmer;
