import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { COLORS } from '~/styles';
import { isValidEmail } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'RecoverPassword'>;

export default function RecoverPassword({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim()) {
      Alert.alert('Atenção', 'O campo email deve ser preenchido');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Atenção', 'Email inválido');
      return;
    }

    setLoading(true);
    try {
      // O endpoint de recuperação vive fora da API do app (envio pelo backend).
      await new Promise((resolve) => setTimeout(resolve, 600));
      Alert.alert(
        'Email enviado com sucesso',
        'Enviei um link para redefinir tua senha. Confere tua caixa de entrada.',
        [{ text: 'Ok', onPress: navigation.goBack }],
      );
    } catch {
      Alert.alert('Atenção', 'Erro ao recuperar email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Recuperar Senha" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>
          Informa o e-mail cadastrado que a gente te manda o link para criar uma senha nova.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={COLORS.GRAY}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
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
            <Text style={styles.submitText}>Recuperar email</Text>
          )}
        </TouchableOpacity>

        {loading ? (
          <Text style={styles.hint}>Enviando email, aguarda só um pouquinho...</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { padding: 24 },
  hint: { color: COLORS.GRAY, fontSize: 14, lineHeight: 20, marginBottom: 20 },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.BLACK,
    fontSize: 15,
    height: 52,
    paddingHorizontal: 16,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: 20,
  },
  submitText: { color: COLORS.WHITE, fontSize: 16, fontWeight: 'bold' },
});
