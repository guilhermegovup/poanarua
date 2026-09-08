import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';
import { POA_CENTER } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Maps'>;

/** Escolha da localização do evento: arrasta o pin ou toca no mapa. */
export default function Maps({ navigation, route }: Props) {
  const initial = {
    latitude: Number(route.params?.latitude) || POA_CENTER.latitude,
    longitude: Number(route.params?.longitude) || POA_CENTER.longitude,
  };

  const [coordinate, setCoordinate] = useState(initial);

  function confirm() {
    route.params?.onConfirm?.({
      latitude: String(coordinate.latitude),
      longitude: String(coordinate.longitude),
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Localização do evento" onBack={navigation.goBack} />

      <Text style={styles.hint}>Arraste o pin para o local do evento</Text>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{ ...initial, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        onPress={(event: MapPressEvent) => setCoordinate(event.nativeEvent.coordinate)}
      >
        <Marker
          draggable
          coordinate={coordinate}
          onDragEnd={(event) => setCoordinate(event.nativeEvent.coordinate)}
        />
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.coordinate}>{`LATITUDE: ${coordinate.latitude.toFixed(6)}`}</Text>
        <Text style={styles.coordinate}>{`LONGITUDE: ${coordinate.longitude.toFixed(6)}`}</Text>

        <TouchableOpacity style={styles.button} onPress={confirm} activeOpacity={0.85}>
          <Text style={styles.buttonText}>LOCALIZAÇÃO OK</Text>
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
    marginTop: 14,
  },
  buttonText: { color: COLORS.WHITE, fontSize: 15, fontWeight: 'bold' },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  coordinate: { color: COLORS.GRAY, fontSize: 12, marginBottom: 2 },
  footer: { padding: 16 },
  hint: { color: COLORS.GRAY, fontSize: 13, paddingHorizontal: 16, paddingVertical: 10 },
  map: { flex: 1 },
});
