import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import logo from '~/assets/logo.png';
import { AvatarLetter, LoginRequired } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { User } from '~/types';
import { allowedUser, clearCache, sendMetrics, support } from '~/utils';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type MenuRoute = 'MyEvents' | 'RegisterEvent' | 'FavoritesEvents' | 'About' | 'Edit';

export default function Perfil() {
  const navigation = useNavigation<Navigation>();

  const [user, setUser] = useState<User | null>(null);
  const [logged, setLogged] = useState(false);
  const [warning, setWarning] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        const current = await storage.getUser();
        const allowed = await allowedUser();
        if (!active) return;
        setUser(current);
        setLogged(allowed);
      }

      load();
      return () => {
        active = false;
      };
    }, []),
  );

  function go(route: MenuRoute) {
    // "Sobre" é a única área liberada para quem entrou sem cadastro.
    if (!logged && route !== 'About') {
      setWarning(true);
      return;
    }
    sendMetrics(`Ck_perfil_${route}`);
    navigation.navigate(route as never);
  }

  async function signOut() {
    await clearCache();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  function confirmSignOut() {
    if (!logged) {
      signOut();
      return;
    }

    Alert.alert('Você tem certeza que deseja sair?', '', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: signOut },
    ]);
  }

  const avatarUri = user?.avatar?.url ?? user?.photo ?? null;

  const items: {
    route?: MenuRoute;
    icon: React.ReactNode;
    label: string;
    visible: boolean;
    onPress?: () => void;
  }[] = [
    {
      route: 'MyEvents',
      icon: <MaterialIcons name="star-border" size={25} color={COLORS.GRAY} />,
      label: 'Meus eventos cadastrados',
      visible: logged,
    },
    {
      route: 'RegisterEvent',
      icon: <Ionicons name="add-circle-outline" size={25} color={COLORS.GRAY} />,
      label: 'Cadastrar evento',
      visible: logged,
    },
    {
      route: 'FavoritesEvents',
      icon: <Ionicons name="heart-outline" size={25} color={COLORS.GRAY} />,
      label: 'Meus eventos favoritos',
      visible: true,
    },
    {
      route: 'About',
      icon: <Ionicons name="help-circle-outline" size={25} color={COLORS.GRAY} />,
      label: 'Sobre Poa na Rua',
      visible: true,
    },
    {
      icon: <Ionicons name="lock-closed-outline" size={25} color={COLORS.GRAY} />,
      label: 'Política de Privacidade',
      visible: true,
      onPress: support.privacy,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <AvatarLetter name={user?.name} size={80} />
          )}

          <View style={styles.cardText}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name}
            </Text>
            <TouchableOpacity style={styles.editRow} onPress={() => go('Edit')}>
              <Text style={styles.editText}>Editar cadastro</Text>
              <Ionicons name="settings-outline" size={22} color={COLORS.GRAY} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {items
          .filter((item) => item.visible)
          .map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.item}
              activeOpacity={0.7}
              onPress={item.onPress ?? (() => item.route && go(item.route))}
            >
              {item.icon}
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={22} color={COLORS.GRAY} />
            </TouchableOpacity>
          ))}

        <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={confirmSignOut}>
          <Ionicons name="log-out-outline" size={25} color={COLORS.COLOR_MAIN} />
          <Text style={[styles.itemLabel, styles.signOut]}>
            {logged ? 'Sair da conta' : 'Entrar na minha conta'}
          </Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.GRAY} />
        </TouchableOpacity>
      </ScrollView>

      <LoginRequired
        visible={warning}
        message="Para acessar esse recurso, é necessário estar logado."
        onDismiss={() => setWarning(false)}
        onLogin={signOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: 40, height: 80, width: 80 },
  card: { alignItems: 'center', flexDirection: 'row', marginBottom: 20 },
  cardText: { flex: 1, marginLeft: 16 },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { padding: 16 },
  editIcon: { marginLeft: 10 },
  editRow: { alignItems: 'center', flexDirection: 'row' },
  editText: { color: COLORS.GRAY, fontSize: 14 },
  header: { alignItems: 'center', paddingVertical: 14 },
  item: {
    alignItems: 'center',
    borderBottomColor: COLORS.BORDER_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  itemLabel: { color: COLORS.BLACK, flex: 1, fontSize: 15, marginLeft: 14 },
  logo: { height: 40, width: 40 },
  name: { color: COLORS.BLACK, fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  signOut: { color: COLORS.COLOR_MAIN, fontWeight: 'bold' },
});
