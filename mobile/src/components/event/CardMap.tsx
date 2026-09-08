import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { COLORS } from '~/styles';
import type { EventItem } from '~/types';

interface Props {
  event: EventItem;
  onPressRoutes: () => void;
}

/** Mini mapa do evento com atalho para "VER ROTAS". */
export function CardMap({ event, onPressRoutes }: Props) {
  const location = event.locations[0];
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        pointerEvents="none"
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} title={event.name} />
      </MapView>

      <TouchableOpacity style={styles.button} onPress={onPressRoutes} activeOpacity={0.85}>
        <Ionicons name="navigate" size={18} color={COLORS.WHITE} />
        <Text style={styles.buttonText}>VER ROTAS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: { color: COLORS.WHITE, fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  container: { paddingHorizontal: 15, paddingVertical: 10 },
  map: { borderRadius: 10, height: 180, width: '100%' },
});

export default CardMap;
