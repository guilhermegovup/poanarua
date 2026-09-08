import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import appleMaps from '~/assets/applemaps.png';
import googleMaps from '~/assets/nav_maps.png';
import waze from '~/assets/nav_waze.png';
import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';
import { googleMapsWebUrl, openUrl, wazeUrl } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'CallShowRoutes'>;

/** Seletor de app de navegação, igual ao do app original. */
export default function CallShowRoutes({ navigation, route }: Props) {
  const location = { latitude: route.params.latitude, longitude: route.params.longitude };

  const options = [
    { icon: googleMaps, label: 'Google Maps', url: googleMapsWebUrl(location) },
    { icon: waze, label: 'Waze', url: wazeUrl(location) },
    ...(Platform.OS === 'ios'
      ? [
          {
            icon: appleMaps,
            label: 'Apple Maps',
            url: `http://maps.apple.com/?daddr=${location.latitude},${location.longitude}`,
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Selecione o APP para navegação" onBack={navigation.goBack} />

      <View style={styles.content}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.label}
            style={styles.option}
            activeOpacity={0.8}
            onPress={() => {
              openUrl(option.url);
              navigation.goBack();
            }}
          >
            <Image source={option.icon} style={styles.icon} resizeMode="contain" />
            <Text style={styles.label}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { padding: 20 },
  icon: { height: 42, width: 42 },
  label: { color: COLORS.BLACK, fontSize: 16, marginLeft: 16 },
  option: {
    alignItems: 'center',
    borderBottomColor: COLORS.BORDER_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 16,
  },
});
