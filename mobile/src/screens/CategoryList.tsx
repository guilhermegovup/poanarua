import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, EventListItem, ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { GetAllPlaces } from '~/services';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryList'>;

export default function CategoryList({ navigation, route }: Props) {
  const { category } = route.params;
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setEvents(await GetAllPlaces());
      } catch {
        setEvents((await storage.getEvents()) ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = events.filter((event) =>
    event.categories.some((item) => item.id === category.id),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title={category.name} onBack={navigation.goBack} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={filtered.length ? undefined : styles.empty}
        renderItem={({ item }) => (
          <EventListItem
            event={item}
            onPress={() => navigation.push('DescriptionEvent', { event: item })}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="search-outline"
              title="Nenhum evento encontrado."
              subtitle="Quem sabe em outra categoria."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  empty: { flexGrow: 1 },
});
