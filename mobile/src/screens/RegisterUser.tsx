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
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { CreateUser } from '~/services';
import { COLORS } from '~/styles';
import { hasFullName, isValidEmail, isValidPassword, support } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterUser'>;

export default function RegisterUser({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return 'O campo nome deve ser preenchido';
    if (!hasFullName(name)) return 'Favor informar nome com sobrenome';
    if (!email.trim()) return 'O campo email deve ser preenchido';
    if (!isValidEmail(email)) return 'Email inválido';
    if (!password) return 'O campo senha deve ser preenchido';
    if (!isValidPassword(password)) return 'A senha deve conter no minimo 6 caracteres';
    if (password !== confirmation) return 'A senha não confere';
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
      await CreateUser({ name: name.trim(), email: email.trim(), password });
      Alert.alert(
        'Email enviado com sucesso',
        'Para finalizar o teu cadastro, acesse o link que acabamos de enviar pro teu email ;)',
        [{ text: 'Ok', onPress: () => navigation.navigate('LoginWithEmail') }],
      );
    } catch (requestError) {
      Alert.alert('Atenção', (requestError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Criar Conta" onBack={navigation.goBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.input}
            placeholder="Nome e Sobrenome"
            placeholderTextColor={COLORS.GRAY}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={COLORS.GRAY}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={COLORS.GRAY}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Senha"
            placeholderTextColor={COLORS.GRAY}
            secureTextEntry
            autoCapitalize="none"
            value={confirmation}
            onChangeText={setConfirmation}
          />

          <TouchableOpacity
            style={styles.submit}
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.submitText}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          {loading ? (
            <Text style={styles.loadingHint}>Criando tua conta, espera só um pouquinho...</Text>
          ) : null}

          <Text style={styles.terms}>
            Ao se registrar, você concorda com nossos{' '}
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
  loadingHint: { color: COLORS.GRAY, fontSize: 13, marginTop: 12, textAlign: 'center' },
  submit: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: 16,
  },
  submitText: { color: COLORS.WHITE, fontSize: 16, fontWeight: 'bold' },
  terms: { color: COLORS.GRAY, fontSize: 12, lineHeight: 18, marginTop: 30, textAlign: 'center' },
  termsLink: { color: COLORS.COLOR_MAIN, fontWeight: 'bold' },
});
