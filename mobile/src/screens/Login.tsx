import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import background from '~/assets/login_background.png';
import logo from '~/assets/logo_poa.png';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';
import { enterAsAnonymous, support } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

/**
 * Porta de entrada do app. Os logins sociais do original (Facebook, Google e
 * Apple) exigem credenciais próprias; aqui ficam desativados com um aviso, e o
 * login por e-mail e o modo "Conhecer o APP" seguem funcionando.
 */
export default function Login({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  async function enterAnonymously() {
    setLoading(true);
    await enterAsAnonymous();
    setLoading(false);
    navigation.replace('Main');
  }

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={[styles.container, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Tudo que acontece</Text>
          <Text style={styles.title}>em Porto Alegre</Text>
          <Text style={styles.subtitle}>Todos os dias. Em um só lugar.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonEmail]}
            onPress={() => navigation.navigate('LoginWithEmail')}
            activeOpacity={0.85}
          >
            <Ionicons name="mail" size={20} color={COLORS.WHITE} />
            <Text style={styles.buttonText}>Iniciar sessão com Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostButton}
            onPress={enterAnonymously}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.ghostText}>Conhecer o APP</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            Ao fazer login, você concorda com nossos{' '}
            <Text style={styles.link} onPress={support.terms}>
              Termos de uso
            </Text>{' '}
            e a{' '}
            <Text style={styles.link} onPress={support.privacy}>
              Política de Privacidade
            </Text>
            .
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  actions: { width: '100%' },
  background: { flex: 1 },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  buttonEmail: { backgroundColor: COLORS.COLOR_MAIN },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  container: {
    backgroundColor: COLORS.TRANSPARENT_50,
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  ghostButton: {
    alignItems: 'center',
    borderColor: COLORS.WHITE,
    borderRadius: 10,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
  },
  ghostText: { color: COLORS.WHITE, fontSize: 15, fontWeight: 'bold' },
  header: { alignItems: 'center', marginTop: 20 },
  link: { fontWeight: 'bold', textDecorationLine: 'underline' },
  logo: { height: 120, marginBottom: 20, width: 120 },
  subtitle: { color: COLORS.WHITE, fontSize: 15, marginTop: 10 },
  terms: {
    color: COLORS.WHITE,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
    textAlign: 'center',
  },
  title: { color: COLORS.WHITE, fontSize: 26, fontWeight: 'bold' },
});
