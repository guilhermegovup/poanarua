import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '~/styles';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

/** Cabeçalho das telas internas (favoritos, meus eventos, cadastro...). */
export function ScreenHeader({ title, onBack, right }: Props) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={COLORS.COLOR_MAIN} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: COLORS.BORDER_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  right: { alignItems: 'flex-end', width: 26 },
  spacer: { width: 26 },
  title: {
    color: COLORS.BLACK,
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});

export default ScreenHeader;
