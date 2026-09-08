import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import placeholder from '~/assets/image_profile.png';
import { COLORS } from '~/styles';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
}

/**
 * Foto do usuário. Sem foto usamos a inicial do nome e, sem nome, o avatar
 * genérico que o app original trazia.
 */
export function AvatarLetter({ uri, name, size = 48 }: Props) {
  const radius = { width: size, height: size, borderRadius: size / 2 };
  const initial = name?.trim()?.charAt(0);

  if (uri) {
    return <Image source={{ uri }} style={radius} resizeMode="cover" />;
  }

  if (!initial) {
    return <Image source={placeholder} style={radius} resizeMode="cover" />;
  }

  return (
    <View style={[styles.letter, radius]}>
      <Text style={[styles.text, { fontSize: size / 2.2 }]}>{initial.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  letter: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    justifyContent: 'center',
  },
  text: { color: COLORS.WHITE, fontWeight: 'bold' },
});

export default AvatarLetter;
