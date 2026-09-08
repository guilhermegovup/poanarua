import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

const CARD_WIDTH = Dimensions.get('window').width - 20;

interface Props {
  events: EventItem[];
  onPressEvent: (event: EventItem) => void;
}

/** Carrossel de destaques (eventos com banner === 'TOP'). */
export function CarouselImagesTop({ events, onPressEvent }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<EventItem>>(null);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.x;
    setIndex(Math.round(offset / CARD_WIDTH));
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={events}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => onPressEvent(item)}
          >
            <Image source={{ uri: item.image.url }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        )}
      />

      <View style={styles.dots}>
        {events.map((item, dotIndex) => (
          <View
            key={item.id}
            style={[styles.dot, dotIndex === index ? styles.dotActive : null]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, height: 400, overflow: 'hidden', width: CARD_WIDTH },
  container: { height: 400, marginBottom: 15, marginTop: 10 },
  dot: {
    backgroundColor: COLORS.GRAY,
    borderRadius: 6,
    height: 10,
    marginHorizontal: 4,
    width: 10,
  },
  dotActive: { backgroundColor: COLORS.COLOR_MAIN },
  dots: {
    alignSelf: 'center',
    bottom: 14,
    flexDirection: 'row',
    position: 'absolute',
  },
  image: { height: '100%', width: '100%' },
});

export default CarouselImagesTop;
