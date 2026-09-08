import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { GetAllCategories } from '~/services';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { Category } from '~/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoriesByRegister'>;

export default function CategoriesByRegister({ navigation, route }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>(
    route.params.selected.map((item) => item.id),
  );

  useEffect(() => {
    GetAllCategories()
      .then(setCategories)
      .catch(async () => setCategories((await storage.getCategories()) ?? []));
  }, []);

  function toggle(id: number) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function confirm() {
    route.params.onConfirm(
      categories
        .filter((category) => selected.includes(category.id))
        .map((category) => ({ ...category, checked: true })),
    );
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="SELECIONAR CATEGORIAS" onBack={navigation.goBack} />

      <Text style={styles.hint}>Selecione a(s) categoria(s) que seu evento se enquadra:</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const checked = selected.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.item}
              onPress={() => toggle(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={checked ? 'checkbox' : 'square-outline'}
                size={24}
                color={checked ? COLORS.COLOR_MAIN : COLORS.GRAY}
              />
              <Text style={styles.label}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={confirm} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
  },
  buttonText: { color: COLORS.WHITE, fontSize: 15, fontWeight: 'bold' },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  footer: { padding: 16 },
  hint: { color: COLORS.GRAY, fontSize: 13, padding: 16 },
  item: {
    alignItems: 'center',
    borderBottomColor: COLORS.BORDER_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { color: COLORS.BLACK, flex: 1, fontSize: 14, marginLeft: 12 },
});
