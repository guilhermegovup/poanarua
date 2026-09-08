import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '~/styles';
import type { Flag } from '~/types';
import { openUrl } from '~/utils';

export function Flags({ flags }: { flags: Flag[] }) {
  if (!flags.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LINKS ÚTEIS</Text>
      {flags.map((flag) => (
        <TouchableOpacity
          key={flag.id}
          style={styles.item}
          disabled={!flag.link}
          onPress={() => flag.link && openUrl(flag.link)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.GREEN} />
          <Text style={styles.label}>{flag.name}</Text>
          {flag.link ? (
            <Ionicons name="open-outline" size={18} color={COLORS.GRAY} />
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15, paddingVertical: 10 },
  item: { alignItems: 'center', flexDirection: 'row', paddingVertical: 8 },
  label: { color: COLORS.BLACK, flex: 1, fontSize: 14, marginLeft: 10 },
  title: {
    color: COLORS.GRAY,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
});

export default Flags;
