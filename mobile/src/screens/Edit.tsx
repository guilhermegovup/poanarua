import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarLetter, ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { SendImageToServer, UpdateUserData } from '~/services';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { UploadedFile, User } from '~/types';
import { isValidBirthday, isValidPhone, maskDate, maskPhone } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Edit'>;

export default function Edit({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [avatar, setAvatar] = useState<UploadedFile | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    storage.getUser().then((current) => {
      if (!current) return;
      setUser(current);
      setName(current.name ?? '');
      setPhone(current.phone ?? '');
      setBirthday(current.birthday ?? '');
      setAvatar(current.avatar ?? null);
    });
  }, []);

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Atenção', 'Preciso da tua permissão para acessar as fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;
    setLocalAvatar(result.assets[0].uri);
  }

  async function submit() {
    if (!user) return;

    if (!name.trim()) {
      Alert.alert('Atenção', 'O campo nome tem que está preenchido.');
      return;
    }
    if (phone && !isValidPhone(phone)) {
      Alert.alert('Atenção', 'O telefone está incorreto!');
      return;
    }
    if (birthday && !isValidBirthday(birthday)) {
      Alert.alert('Atenção', 'Data de nascimento invalida!');
      return;
    }

    setSaving(true);
    try {
      let uploaded = avatar;

      if (localAvatar) {
        uploaded = await SendImageToServer({ uri: localAvatar });
        setAvatar(uploaded);
      }

      const updated = await UpdateUserData({
        id: user.id,
        name: name.trim(),
        phone,
        birthday,
        avatar: uploaded,
      });

      await storage.setUser(updated);
      Alert.alert('Dados atualizados com sucesso!', '', [
        { text: 'Ok', onPress: navigation.goBack },
      ]);
    } catch {
      Alert.alert('Atenção', 'Erro ao atualizar dados do usuário.');
    } finally {
      setSaving(false);
    }
  }

  const avatarUri = localAvatar ?? avatar?.url ?? user?.photo ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Editar cadastro" onBack={navigation.goBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.avatarButton} onPress={pickAvatar} activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <AvatarLetter name={name} size={110} />
            )}
            <Text style={styles.avatarLabel}>Selecionar imagem</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user?.email}
            editable={false}
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            keyboardType="phone-pad"
            onChangeText={(value) => setPhone(maskPhone(value))}
            placeholder="(51) 99999-9999"
            placeholderTextColor={COLORS.GRAY}
          />

          <Text style={styles.label}>Aniversário</Text>
          <TextInput
            style={styles.input}
            value={birthday}
            keyboardType="number-pad"
            onChangeText={(value) => setBirthday(maskDate(value))}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={COLORS.GRAY}
          />

          <TouchableOpacity
            style={styles.submit}
            onPress={submit}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.submitText}>Salvar</Text>
            )}
          </TouchableOpacity>

          {saving ? (
            <Text style={styles.hint}>Atualizando os dados aqui, rapidão...</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: 55, height: 110, width: 110 },
  avatarButton: { alignItems: 'center', marginBottom: 24 },
  avatarLabel: { color: COLORS.COLOR_MAIN, fontSize: 13, fontWeight: 'bold', marginTop: 10 },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { padding: 20 },
  flex: { flex: 1 },
  hint: { color: COLORS.GRAY, fontSize: 13, marginTop: 12, textAlign: 'center' },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.BLACK,
    fontSize: 15,
    height: 50,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  inputDisabled: { color: COLORS.GRAY },
  label: { color: COLORS.GRAY, fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  submit: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: 16,
  },
  submitText: { color: COLORS.WHITE, fontSize: 16, fontWeight: 'bold' },
});
