import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BackButton, Shimmer } from '~/components/shared';
import {
  Address,
  CardMap,
  Contacts,
  Description,
  FirstDescription,
  Flags,
  Gallery,
  GoEvent,
  Opinion,
} from '~/components/event';
import type { RootStackParamList } from '~/navigation/types';
import { GetPlaceById } from '~/services';
import { COLORS } from '~/styles';
import type { EventItem } from '~/types';
import { sendMetricsEventOpen } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'DescriptionEvent'>;

/** Tela cheia do evento: capa, presença, descrição, contatos, mapa e opiniões. */
export default function DescriptionEvent({ navigation, route }: Props) {
  const preview = route.params.event;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [opinionsKey, setOpinionsKey] = useState(0);

  const load = useCallback(async () => {
    try {
      const { event: loaded } = await GetPlaceById(preview.id);
      sendMetricsEventOpen(`View_${loaded.name}`);
      setEvent(loaded);
    } catch {
      // Sem rede, seguimos com o resumo que veio da listagem.
      setEvent(preview);
    }
  }, [preview]);

  useEffect(() => {
    load();
  }, [load]);

  // Ao voltar de "SendOpinion" a lista de comentários precisa vir de novo.
  useFocusEffect(
    useCallback(() => {
      setOpinionsKey((value) => value + 1);
    }, []),
  );

  const goToLogin = () => navigation.navigate('Login');

  const location = event?.locations?.[0];
  const hasCoordinates =
    !!location &&
    location.latitude !== '' &&
    location.latitude !== 0 &&
    location.longitude !== '' &&
    location.longitude !== 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: preview.image.url }}
          style={styles.cover}
          resizeMode="cover"
        />

        {!event ? (
          <View style={styles.shimmer}>
            {[90, 130, 250, 220].map((height, index) => (
              <Shimmer key={index} style={{ borderRadius: 10, height, marginTop: 10 }} />
            ))}
          </View>
        ) : (
          <>
            <GoEvent event={event} onRequireLogin={goToLogin} />
            <FirstDescription event={event} onRequireLogin={goToLogin} />
            <Description event={event} />
            <Contacts contacts={event.contacts} />
            <Address event={event} />
            <Flags flags={event.flags} />

            {hasCoordinates ? (
              <CardMap
                event={event}
                onPressRoutes={() =>
                  navigation.navigate('CallShowRoutes', {
                    latitude: location!.latitude,
                    longitude: location!.longitude,
                    name: event.name,
                  })
                }
              />
            ) : null}

            <Gallery event={event} onRequireLogin={goToLogin} />

            <Opinion
              event={event}
              reloadKey={opinionsKey}
              onRequireLogin={goToLogin}
              onWriteOpinion={() =>
                navigation.navigate('SendOpinion', { event })
              }
            />
          </>
        )}
      </ScrollView>

      <BackButton onPress={navigation.goBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { paddingBottom: 30 },
  cover: { height: 300, width: '100%' },
  shimmer: { padding: 15 },
});
