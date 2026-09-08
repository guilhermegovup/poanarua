import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';

import { COLORS } from '~/styles';
import type { Category } from '~/types';

interface Props {
  categories: Category[];
  onPressCategory: (category: Category) => void;
}

/** Grade 2x N da seção "Bora curtir POA?". */
export function Categories({ categories, onPressCategory }: Props) {
  return (
    <FlatList
      data={categories}
      numColumns={2}
      scrollEnabled={false}
      keyExtractor={(item) => String(item.id)}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <TouchableHighlight
          style={styles.card}
          underlayColor={COLORS.TRANSPARENT}
          onPress={() => onPressCategory(item)}
        >
          <View style={styles.inner}>
            {item.url ? (
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.image, styles.placeholder]} />
            )}
            <View style={styles.overlay}>
              <Text style={styles.label} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, flex: 1, height: 110, marginHorizontal: 4, overflow: 'hidden' },
  image: { height: '100%', width: '100%' },
  inner: { borderRadius: 10, flex: 1, overflow: 'hidden' },
  label: { color: COLORS.WHITE, fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  overlay: {
    alignItems: 'center',
    backgroundColor: COLORS.TRANSPARENT_50,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 6,
    paddingVertical: 8,
    position: 'absolute',
    right: 0,
  },
  placeholder: { backgroundColor: COLORS.BORDER_GRAY },
  row: { marginBottom: 10 },
});

export default Categories;
