import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, EventListItem } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';
import type { Category } from '~/types';
import { htmlToPlainText } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

/** Busca por nome, endereço, descrição e tags, com filtro por categoria. */
export default function Search({ navigation, route }: Props) {
  const events = route.params.events ?? [];
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState<Category | null>(null);

  const categories = useMemo(() => {
    const map = new Map<number, Category>();
    events.forEach((event) =>
      event.categories.forEach((item) => map.set(item.id, item)),
    );
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [events]);

  const results = useMemo(() => {
    const needle = term.trim().toLowerCase();

    return events.filter((event) => {
      if (category && !event.categories.some((item) => item.id === category.id)) {
        return false;
      }
      if (!needle) return true;

      const haystack = [
        event.name,
        event.address,
        htmlToPlainText(event.description),
        ...event.tags.map((tag) => tag.name),
        ...event.categories.map((item) => item.name),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [category, events, term]);

  const searching = term.trim().length > 0 || category !== null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Eventos</Text>
        <TouchableOpacity onPress={navigation.goBack} hitSlop={12}>
          <Text style={styles.close}>Fechar X</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.GRAY} />
        <TextInput
          style={styles.input}
          placeholder="O que tu quer fazer?"
          placeholderTextColor={COLORS.GRAY}
          value={term}
          onChangeText={setTerm}
          autoFocus
          returnKeyType="search"
        />
        {term ? (
          <TouchableOpacity onPress={() => setTerm('')} hitSlop={10}>
            <Ionicons name="close-circle" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const active = category?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.chip, active ? styles.chipActive : null]}
              onPress={() => setCategory(active ? null : item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={results.length ? undefined : styles.empty}
        renderItem={({ item }) => (
          <EventListItem
            event={item}
            onPress={() => navigation.navigate('DescriptionEvent', { event: item })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={searching ? 'Nenhum evento encontrado.' : 'Nenhum parametro de busca inserido'}
            subtitle={searching ? 'Tente buscar com outros parametros' : undefined}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: COLORS.SEARCH_BACKGROUND,
    borderRadius: 16,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: COLORS.COLOR_MAIN },
  chipText: { color: COLORS.BLACK, fontSize: 12, fontWeight: 'bold' },
  chipTextActive: { color: COLORS.WHITE },
  chips: { paddingBottom: 14, paddingHorizontal: 14 },
  close: { color: COLORS.COLOR_MAIN, fontSize: 14, fontWeight: 'bold' },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  empty: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  input: { color: COLORS.BLACK, flex: 1, fontSize: 15, marginHorizontal: 10 },
  searchBox: {
    alignItems: 'center',
    backgroundColor: COLORS.SEARCH_BACKGROUND,
    borderRadius: 10,
    flexDirection: 'row',
    height: 48,
    marginBottom: 14,
    marginHorizontal: 14,
    paddingHorizontal: 14,
  },
  title: { color: COLORS.BLACK, fontSize: 18, fontWeight: 'bold' },
});
