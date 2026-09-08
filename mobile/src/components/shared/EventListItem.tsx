import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

interface Props {
  event: EventItem;
  onPress: () => void;
  right?: React.ReactNode;
}

/** Linha de evento usada em favoritos, meus eventos, busca e categorias. */
export function EventListItem({ event, onPress, right }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: event.image.url }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {event.name}
        </Text>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.GRAY} />
          <Text style={styles.meta}>{event.event_date}</Text>
          {event.hour ? (
            <>
              <Ionicons name="time-outline" size={13} color={COLORS.GRAY} style={styles.icon} />
              <Text style={styles.meta}>{event.hour}</Text>
            </>
          ) : null}
        </View>

        {event.address ? (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={13} color={COLORS.GRAY} />
            <Text style={styles.meta} numberOfLines={1}>
              {event.address}
            </Text>
          </View>
        ) : null}
      </View>

      {right}
    </TouchableOpacity>
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
  content: { flex: 1, marginLeft: 12 },
  icon: { marginLeft: 10 },
  image: { borderRadius: 8, height: 76, width: 76 },
  meta: { color: COLORS.GRAY, fontSize: 12, marginLeft: 5 },
  name: { color: COLORS.BLACK, fontSize: 14, fontWeight: 'bold' },
  row: { alignItems: 'center', flexDirection: 'row', marginTop: 6 },
});

export default EventListItem;
