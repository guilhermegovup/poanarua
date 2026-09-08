import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

export function Address({ event }: { event: EventItem }) {
  if (!event.address) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ENDEREÇO</Text>
      <View style={styles.row}>
        <Ionicons name="location-outline" size={20} color={COLORS.COLOR_MAIN} />
        <Text style={styles.address}>{event.address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  address: { color: COLORS.BLACK, flex: 1, fontSize: 14, marginLeft: 8 },
  container: { paddingHorizontal: 15, paddingVertical: 10 },
  row: { alignItems: 'center', flexDirection: 'row' },
  title: {
    color: COLORS.GRAY,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
});

export default Address;
