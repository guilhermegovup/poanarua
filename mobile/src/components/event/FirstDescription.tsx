import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { LoginRequired } from '~/components/shared';
import { GetEventFavorite, SetFavoritePlace } from '~/services';
import { COLORS } from '~/styles';
import type { EventItem } from '~/types';
import {
  allowedUser,
  calculateDistance,
  getLocation,
  sendMetricsEvent,
  shareEvent,
} from '~/utils';

interface Props {
  event: EventItem;
  onRequireLogin: () => void;
}

/** Cabeçalho do evento: data, nome, distância, compartilhar e favoritar. */
export function FirstDescription({ event, onRequireLogin }: Props) {
  const [favorite, setFavorite] = useState(Boolean(event.favorite));
  const [distance, setDistance] = useState(0);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    let active = true;

    async function computeDistance() {
      const location = event.locations?.[0];
      if (!location?.latitude || !location?.longitude) return;

      const coords = await getLocation();
      if (!coords || !active) return;

      setDistance(
        calculateDistance({
          lat1: coords.latitude,
          lon1: coords.longitude,
          lat2: Number(location.latitude),
          lon2: Number(location.longitude),
        }),
      );
    }

    async function loadFavorite() {
      try {
        const result = await GetEventFavorite(event.id);
        if (active) setFavorite(Boolean(result.favorite));
      } catch {
        /* mantém o valor que veio no evento */
      }
    }

    computeDistance();
    loadFavorite();

    return () => {
      active = false;
    };
  }, [event]);

  function track(action: string) {
    sendMetricsEvent({
      event_app_screen: 'DescriptionEvent',
      action: `CK_em_${action}_${event.name}`,
      name: event.name,
      category: event.categories[0]?.id,
      id: event.id,
    });
  }

  async function toggleFavorite() {
    track('Favoritar');

    if (!(await allowedUser())) {
      setWarning(true);
      return;
    }

    const next = !favorite;
    setFavorite(next);
    try {
      await SetFavoritePlace({ event_id: event.id, favorite: next });
    } catch {
      setFavorite(!next);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{`${event.event_date} ${event.name}`}</Text>
        {distance !== 0 ? <Text style={styles.distance}>{`${distance} km`}</Text> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.action}
          onPress={() => {
            track('Compartilhar');
            shareEvent(event);
          }}
        >
          <Ionicons name="share-social" size={25} color={COLORS.COLOR_MAIN} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={toggleFavorite}>
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={25}
            color={COLORS.COLOR_MAIN}
          />
        </TouchableOpacity>
      </View>

      <LoginRequired
        visible={warning}
        message="Para acessar esse recurso, é necessário estar logado."
        onDismiss={() => setWarning(false)}
        onLogin={onRequireLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  action: { marginLeft: 18 },
  actions: { flexDirection: 'row' },
  container: {
    alignItems: 'center',
    borderTopColor: COLORS.BORDER_GRAY,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  distance: { color: COLORS.GRAY, fontSize: 13, marginTop: 6 },
  info: { flex: 1, paddingRight: 10 },
  title: { color: COLORS.BLACK, fontSize: 15, fontWeight: 'bold', lineHeight: 21 },
});

export default FirstDescription;
