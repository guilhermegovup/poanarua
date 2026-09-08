import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';
import type { ContactType } from '~/types';
import { CONTACT_ICON, maskPhone } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactsByRegister'>;

const FIELDS: { type: ContactType; label: string; placeholder: string }[] = [
  { type: 'site', label: 'Site', placeholder: 'poanarua.com.br' },
  { type: 'facebook', label: 'Facebook', placeholder: 'nome da página' },
  { type: 'instagram', label: 'Instagram', placeholder: '@perfil' },
  { type: 'whatsapp', label: 'WhatsApp', placeholder: '(51) 99999-9999' },
];

export default function ContactsByRegister({ navigation, route }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      FIELDS.map((field) => [
        field.type,
        route.params.selected.find((item) => item.type === field.type)?.value ?? '',
      ]),
    ),
  );

  function confirm() {
    route.params.onConfirm(
      FIELDS.filter((field) => values[field.type]?.trim()).map((field) => ({
        type: field.type,
        value: values[field.type].trim(),
      })),
    );
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="ADICIONAR CONTATOS" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>Adicionar os contatos para informações sobre o evento:</Text>

        {FIELDS.map((field) => (
          <View key={field.type} style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons
                name={CONTACT_ICON[field.type] as never}
                size={18}
                color={COLORS.COLOR_MAIN}
              />
              <Text style={styles.label}>{field.label}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              placeholderTextColor={COLORS.GRAY}
              autoCapitalize="none"
              keyboardType={field.type === 'whatsapp' ? 'phone-pad' : 'default'}
              value={values[field.type]}
              onChangeText={(value) =>
                setValues((current) => ({
                  ...current,
                  [field.type]: field.type === 'whatsapp' ? maskPhone(value) : value,
                }))
              }
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={confirm} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
  },
  buttonText: { color: COLORS.WHITE, fontSize: 15, fontWeight: 'bold' },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { padding: 16 },
  field: { marginBottom: 16 },
  footer: { padding: 16 },
  hint: { color: COLORS.GRAY, fontSize: 13, marginBottom: 16 },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.BLACK,
    fontSize: 15,
    height: 48,
    paddingHorizontal: 14,
  },
  label: { color: COLORS.BLACK, fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  labelRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 6 },
});
