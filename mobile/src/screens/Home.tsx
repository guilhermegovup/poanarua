import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import logo from '~/assets/logo.png';
import { CardsTodayHas, CarouselImagesTop, Categories } from '~/components/home';
import { SearchFloatButton, Shimmer } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { GetAllCategories, GetAllPlaces, GetAllTags, GetInAppMessage } from '~/services';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { Category, EventItem, User } from '~/types';
import { getLocation, isHappeningToday, sendMetrics } from '~/utils';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function Home() {
  const navigation = useNavigation<Navigation>();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [categoriesResult, eventsResult, tagsResult] = await Promise.allSettled([
      GetAllCategories(),
      GetAllPlaces(),
      GetAllTags(),
    ]);

    if (categoriesResult.status === 'fulfilled') {
      await storage.setCategories(categoriesResult.value);
      setCategories(categoriesResult.value);
    }
    if (eventsResult.status === 'fulfilled') {
      await storage.setEvents(eventsResult.value);
      setEvents(eventsResult.value);
    }
    if (tagsResult.status === 'fulfilled') {
      await storage.setTags(tagsResult.value);
    }

    // Sem rede, mostramos o último conteúdo que ficou em cache.
    if (eventsResult.status === 'rejected') {
      setEvents((await storage.getEvents()) ?? []);
      setCategories((await storage.getCategories()) ?? []);
    }
  }, []);

  useEffect(() => {
    storage.getUser().then(setUser);
    getLocation();
    load();
  }, [load]);

  useEffect(() => {
    async function showInAppMessage() {
      try {
        const message = await GetInAppMessage();
        if (!message?.show) return;

        const seen = await storage.getInAppSeeMessage();
        if (seen?.id === message.id) return;

        navigation.navigate('InAppMessage', { data: message });
      } catch {
        /* mensagem in-app é opcional */
      }
    }

    showInAppMessage();
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  function openEvent(event: EventItem, origin: string) {
    sendMetrics(`CK_${origin}_${event.name.replace(' ', '_')}`);
    navigation.navigate('DescriptionEvent', { event });
  }

  const bannerTop = events.filter((event) => event.banner === 'TOP');
  const bannerEnd = events.filter((event) => event.banner === 'END');
  const eventsToday = events.filter(isHappeningToday);
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.COLOR_MAIN}
          />
        }
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.greeting}>{`Olá,  ${firstName} ;)`}</Text>
        </View>

        <Shimmer style={styles.carouselShimmer} visible={bannerTop.length !== 0}>
          <CarouselImagesTop
            events={bannerTop}
            onPressEvent={(event) => openEvent(event, 'bTopO')}
          />
        </Shimmer>

        <Text style={styles.sectionTitle}>Hoje Tem :)</Text>
        {eventsToday.length === 0 ? (
          <View style={styles.shimmerRow}>
            {[0, 1, 2, 3].map((key) => (
              <Shimmer key={key} style={styles.shimmerCard} />
            ))}
          </View>
        ) : (
          <CardsTodayHas
            events={eventsToday}
            onPressEvent={(event) => openEvent(event, 'hjTem')}
          />
        )}

        <Text style={styles.sectionTitle}>Bora curtir POA?</Text>
        {categories.length === 0 ? (
          <View style={styles.shimmerRow}>
            {[0, 1, 2].map((key) => (
              <Shimmer key={key} style={styles.shimmerCategory} />
            ))}
          </View>
        ) : (
          <Categories
            categories={categories}
            onPressCategory={(category) => {
              sendMetrics(`Ck_cat_${category.name.replace(' ', '_')}`);
              navigation.navigate('CategoryList', { category });
            }}
          />
        )}

        <Text style={styles.sectionTitle}>Novidades por aqui:</Text>
        <Shimmer style={styles.bannerShimmer} visible={bannerEnd.length !== 0}>
          {bannerEnd.length ? (
            <TouchableHighlight
              style={styles.bannerContainer}
              underlayColor={COLORS.BORDER_GRAY}
              onPress={() => openEvent(bannerEnd[0], 'bannerFim')}
            >
              <Image
                source={{ uri: bannerEnd[0].image_banner?.url ?? bannerEnd[0].image.url }}
                style={styles.banner}
                resizeMode="cover"
              />
            </TouchableHighlight>
          ) : null}
        </Shimmer>
      </ScrollView>

      <SearchFloatButton onPress={() => navigation.navigate('Search', { events })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 3, height: 80, width: '100%' },
  bannerContainer: { borderRadius: 6, height: 80, overflow: 'hidden' },
  bannerShimmer: { borderRadius: 10, height: 80, width: '100%' },
  carouselShimmer: { borderRadius: 10, height: 400, marginTop: 10, width: '100%' },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { paddingBottom: 90, paddingHorizontal: 10 },
  greeting: { color: COLORS.BLACK, fontSize: 20, fontWeight: 'bold' },
  header: { alignItems: 'center', flexDirection: 'row', marginTop: 10, paddingVertical: 8 },
  logo: { height: 35, marginRight: 10, width: 35 },
  sectionTitle: {
    color: COLORS.BLACK,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 18,
    paddingLeft: 5,
  },
  shimmerCard: { borderRadius: 10, height: 140, marginRight: 10, width: 120 },
  shimmerCategory: { borderRadius: 10, height: 110, marginRight: 10, width: '31%' },
  shimmerRow: { flexDirection: 'row' },
});
