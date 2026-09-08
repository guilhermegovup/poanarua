import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { PostSendOpinion } from '~/services';
import { COLORS } from '~/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'SendOpinion'>;

export default function SendOpinion({ navigation, route }: Props) {
  const { event } = route.params;
  const [note, setNote] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    if (note === 0) {
      Alert.alert('Atenção', 'Selecione uma nota!');
      return;
    }

    setSending(true);
    try {
      await PostSendOpinion({ event_id: event.id, comment: comment.trim(), note });
      navigation.goBack();
    } catch {
      Alert.alert('Atenção', 'Ocorreu um erro ao enviar comentario.');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Opinião" onBack={navigation.goBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.event} numberOfLines={2}>
            {event.name}
          </Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setNote(star)} hitSlop={6}>
                <Ionicons
                  name={star <= note ? 'star' : 'star-outline'}
                  size={38}
                  color={COLORS.YELLOW}
                  style={styles.star}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Conta pra gente como foi..."
            placeholderTextColor={COLORS.GRAY}
            multiline
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity
            style={styles.submit}
            onPress={submit}
            disabled={sending}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.submitText}>Enviar opinião</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { flex: 1, padding: 20 },
  event: { color: COLORS.BLACK, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  flex: { flex: 1 },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.BLACK,
    fontSize: 15,
    height: 150,
    padding: 14,
  },
  star: { marginHorizontal: 4 },
  stars: { flexDirection: 'row', justifyContent: 'center', marginVertical: 24 },
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
