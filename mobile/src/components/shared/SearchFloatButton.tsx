import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '~/styles';

/** Botão flutuante de busca, ancorado no canto inferior direito da home. */
export function SearchFloatButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name="search" size={26} color={COLORS.WHITE} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 32,
    bottom: 20,
    elevation: 6,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 60,
  },
});

export default SearchFloatButton;
