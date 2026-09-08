import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, EventListItem, ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { GetMyEvents } from '~/services';
import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyEvents'>;

export default function MyEvents({ navigation }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      GetMyEvents()
        .then((result) => active && setEvents(result))
        .catch(() => active && setEvents([]))
        .finally(() => active && setLoading(false));

      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title="MEUS EVENTOS CADASTRADOS"
        onBack={navigation.goBack}
        right={
          <TouchableOpacity onPress={() => navigation.navigate('RegisterEvent')} hitSlop={12}>
            <Ionicons name="add" size={26} color={COLORS.COLOR_MAIN} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={events.length ? undefined : styles.empty}
        renderItem={({ item }) => (
          <EventListItem
            event={item}
            onPress={() => navigation.navigate('RegisterEvent', { event: item })}
            right={<Ionicons name="create-outline" size={22} color={COLORS.GRAY} />}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="calendar-outline"
              title="Não há eventos cadastrados."
              subtitle="Toca no + para cadastrar o teu primeiro rolê."
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
