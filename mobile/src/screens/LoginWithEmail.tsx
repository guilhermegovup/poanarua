import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { GetToken } from '~/services';
import { COLORS } from '~/styles';
import { isValidEmail, isValidPassword, saveLogin, support } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'LoginWithEmail'>;

export default function LoginWithEmail({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!email.trim()) return 'O campo email deve ser preenchido';
    if (!isValidEmail(email)) return 'Email inválido';
    if (!password) return 'O campo senha deve ser preenchido';
    if (!isValidPassword(password)) return 'A senha deve conter no minimo 6 caracteres';
    return null;
  }

  async function submit() {
    const error = validate();
    if (error) {
      Alert.alert('Atenção', error);
      return;
    }

    setLoading(true);
    try {
      const session = await GetToken({ email: email.trim(), password });
      await saveLogin(session);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (requestError) {
      Alert.alert(
        'Atenção',
        'Hmm, você não digitou seu e-mail ou senha corretamente, se tiver esquecido posso te ajudar!',
      );
      if (__DEV__) console.log(requestError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Login com Email" onBack={navigation.goBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={COLORS.GRAY}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Senha"
              placeholderTextColor={COLORS.GRAY}
              secureTextEntry={secure}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure((value) => !value)} hitSlop={12}>
              <Ionicons
                name={secure ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={COLORS.GRAY}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('RecoverPassword')}>
            <Text style={styles.link}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submit}
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.submitText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {loading ? (
            <Text style={styles.loadingHint}>Efetuando login, aguarda só um pouquinho...</Text>
          ) : null}

          <TouchableOpacity onPress={() => navigation.navigate('RegisterUser')}>
            <Text style={styles.linkCenter}>Ainda não tem conta? Crie a sua agora</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Ao fazer login, você concorda com nossos{' '}
            <Text style={styles.termsLink} onPress={support.terms}>
              Termos de uso
            </Text>{' '}
            e a{' '}
            <Text style={styles.termsLink} onPress={support.privacy}>
              Política de Privacidade
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { padding: 24 },
  flex: { flex: 1 },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.BLACK,
    fontSize: 15,
    height: 52,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  link: { color: COLORS.COLOR_MAIN, fontSize: 13, fontWeight: 'bold' },
  linkCenter: {
    color: COLORS.COLOR_MAIN,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 24,
    textAlign: 'center',
  },
  loadingHint: {
    color: COLORS.GRAY,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  passwordInput: { flex: 1, marginRight: 12 },
  passwordRow: { alignItems: 'center', flexDirection: 'row' },
  submit: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: 24,
  },
  submitText: { color: COLORS.WHITE, fontSize: 16, fontWeight: 'bold' },
  terms: {
    color: COLORS.GRAY,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 30,
    textAlign: 'center',
  },
  termsLink: { color: COLORS.COLOR_MAIN, fontWeight: 'bold' },
});
