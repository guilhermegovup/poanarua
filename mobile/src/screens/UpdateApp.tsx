import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import logo from '~/assets/logo_poa.png';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';
import { support } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateApp'>;

export default function UpdateApp({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>
          Uma nova versão do{'\n'}
          <Text style={styles.brand}>Poa na Rua</Text> está disponível!
        </Text>

        <Text style={styles.description}>
          Atualizamos o aplicativo regularmente para que ele seja o mais útil possível pra ti.
          Tenha a última versão para aproveitar as melhorias e os novos recursos.
        </Text>

        <TouchableOpacity style={styles.button} onPress={support.store} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Atualizar Agora</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.skip}>ou continuar sem atualizar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: { color: COLORS.COLOR_MAIN },
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: 32,
    width: '100%',
  },
  buttonText: { color: COLORS.WHITE, fontSize: 16, fontWeight: 'bold' },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 30 },
  description: {
    color: COLORS.GRAY,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 16,
    textAlign: 'center',
  },
  logo: { height: 120, width: 120 },
  skip: { color: COLORS.GRAY, fontSize: 13, marginTop: 20, textDecorationLine: 'underline' },
  title: {
    color: COLORS.BLACK,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 26,
    textAlign: 'center',
  },
});
