import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';

import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

interface Props {
  events: EventItem[];
  onPressEvent: (event: EventItem) => void;
}

/** Cards horizontais da seção "Hoje Tem :)". */
export function CardsTodayHas({ events, onPressEvent }: Props) {
  return (
    <FlatList
      horizontal
      data={events}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <TouchableHighlight
          style={styles.container}
          underlayColor={COLORS.TRANSPARENT}
          onPress={() => onPressEvent(item)}
        >
          <View style={[styles.card, item.featured ? styles.cardFeatured : null]}>
            <Image source={{ uri: item.image.url }} style={styles.image} resizeMode="cover" />

            <View style={styles.description}>
              <View style={styles.date}>
                <Text style={styles.dateText} numberOfLines={1}>
                  {item.event_date}
                </Text>
              </View>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>
                  {item.name.length > 40 ? `${item.name.substring(0, 37)} ...` : item.name}
                </Text>
              </View>
            </View>

            {item.featured ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>DESTAQUE</Text>
              </View>
            ) : null}
          </View>
        </TouchableHighlight>
      )}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 2,
    paddingHorizontal: 4,
    position: 'absolute',
    right: 0,
    top: 10,
  },
  badgeText: { color: COLORS.WHITE, fontSize: 9, fontWeight: 'bold' },
  card: {
    alignItems: 'center',
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    borderWidth: 2,
    flex: 1,
    overflow: 'hidden',
  },
  cardFeatured: { borderColor: COLORS.ORANGE },
  container: { height: 140, marginRight: 10, width: 120 },
  date: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    justifyContent: 'center',
    paddingVertical: 2,
    width: '100%',
  },
  dateText: { color: COLORS.WHITE, fontSize: 10, fontWeight: 'bold' },
  description: { backgroundColor: COLORS.WHITE, flex: 1, width: '100%' },
  image: { flex: 2, width: '100%' },
  name: { color: COLORS.BLACK, fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  nameContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  list: { height: 150 },
});

export default CardsTodayHas;
