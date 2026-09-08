import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '~/styles';

export function BackButton({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.button, { top: insets.top + 10 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="chevron-back" size={26} color={COLORS.BLUE_FACEBOOK} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 22,
    elevation: 4,
    height: 44,
    justifyContent: 'center',
    left: 14,
    position: 'absolute',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    width: 44,
    zIndex: 10,
  },
});

export default BackButton;
