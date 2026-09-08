import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Easing, Image, StyleSheet, View } from 'react-native';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import logo from '~/assets/logo_poa.png';
import type { RootStackParamList } from '~/navigation/types';
import { CheckUpdateApp } from '~/services';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { AppUpdate } from '~/types';
import { ANONYMOUS_NAME, expiredSession } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_DURATION_MS = 2000;

/** '2.7.1' -> 271, para comparar versões como o app original fazia. */
const versionToNumber = (value: string) => Number(value.replace(/\D/g, '')) || 0;

export default function Splash({ navigation }: Props) {
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scale]);

  useEffect(() => {
    let cancelled = false;

    async function needsUpdate(): Promise<AppUpdate | null> {
      try {
        const updates = await CheckUpdateApp();
        const platform = updates.find((item) => item.platform === Platform.OS);
        if (!platform?.show) return null;

        const installed = versionToNumber(Application.nativeApplicationVersion ?? '0');
        return installed < versionToNumber(platform.version) ? platform : null;
      } catch {
        // Sem conexão com o serviço de versão o app simplesmente segue.
        return null;
      }
    }

    async function bootstrap() {
      try {
        const update = await needsUpdate();
        if (cancelled) return;

        if (update) {
          navigation.replace('UpdateApp', { update });
          return;
        }

        const user = await storage.getUser();
        const token = await storage.getToken();

        if (!user || user.name === ANONYMOUS_NAME || !token) {
          navigation.replace('Login');
          return;
        }

        navigation.replace((await expiredSession()) ? 'Login' : 'Main');
      } catch (error) {
        Alert.alert('Atenção', (error as Error).message);
        navigation.replace('Login');
      }
    }

    const timer = setTimeout(bootstrap, SPLASH_DURATION_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    flex: 1,
    justifyContent: 'center',
  },
  logo: { height: 180, width: 180 },
});
