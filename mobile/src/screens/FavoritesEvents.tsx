import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, EventListItem, ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { GetEventsFavorite } from '~/services';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FavoritesEvents'>;

export default function FavoritesEvents({ navigation }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        try {
          const user = await storage.getUser();
          const favorites = await GetEventsFavorite(user?.id ?? 0);
          if (active) setEvents(favorites);
        } catch {
          if (active) setEvents([]);
        } finally {
          if (active) setLoading(false);
        }
      }

      load();
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="EVENTOS FAVORITOS" onBack={navigation.goBack} />

      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={events.length ? undefined : styles.empty}
        renderItem={({ item }) => (
          <EventListItem
            event={item}
            onPress={() => navigation.push('DescriptionEvent', { event: item })}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="heart-outline"
              title="Nenhum evento favoritado."
              subtitle={'Quando você favoritar o evento,\nvai encontrá-lo aqui!'}
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
