import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '~/styles';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'sad-outline', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={54} color={COLORS.GRAY} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 30 },
  subtitle: {
    color: COLORS.GRAY,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  title: {
    color: COLORS.BLACK,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 14,
    textAlign: 'center',
  },
});

export default EmptyState;
