import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '~/navigation/types';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import { openUrl } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'InAppMessage'>;

/** Comunicado que o time publica pelo painel e aparece ao abrir o app. */
export default function InAppMessage({ navigation, route }: Props) {
  const { data } = route.params;

  function dismiss() {
    storage.setInAppSeeMessage({ id: data.id });
    navigation.goBack();
  }

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.close} onPress={dismiss} hitSlop={12}>
          <Ionicons name="close" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>

        {data.image?.url ? (
          <Image source={{ uri: data.image.url }} style={styles.image} resizeMode="cover" />
        ) : null}

        {data.title ? <Text style={styles.title}>{data.title}</Text> : null}

        {data.link ? (
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => {
              openUrl(data.link!);
              dismiss();
            }}
          >
            <Text style={styles.buttonText}>Quero ver</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: COLORS.TRANSPARENT_70,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: { color: COLORS.WHITE, fontSize: 15, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.WHITE, borderRadius: 12, padding: 20, width: '100%' },
  close: { alignSelf: 'flex-end' },
  image: { borderRadius: 10, height: 220, marginTop: 8, width: '100%' },
  title: {
    color: COLORS.BLACK,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
});
