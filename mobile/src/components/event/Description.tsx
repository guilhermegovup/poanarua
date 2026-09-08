import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HtmlText } from '~/components/shared';
import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

export function Description({ event }: { event: EventItem }) {
  return (
    <View style={styles.container}>
      {event.hour ? (
        <Text style={styles.hour}>{`Horário: ${event.hour}`}</Text>
      ) : null}

      {event.tags?.length ? (
        <View style={styles.tags}>
          {event.tags.map((tag) => (
            <View key={tag.name} style={styles.tag}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <HtmlText html={event.description} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15, paddingVertical: 10 },
  hour: { color: COLORS.BLACK, fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  tag: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    marginBottom: 6,
    marginRight: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { color: COLORS.COLOR_MAIN, fontSize: 11, fontWeight: 'bold' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
});

export default Description;
