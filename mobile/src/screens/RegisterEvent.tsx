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
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import {
  CreateEvent,
  DeleteEvent,
  GetAllTags,
  SendImageToServer,
  UpdateEvent,
} from '~/services';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { Category, Contact, Tag } from '~/types';
import { formatDate, htmlToPlainText, maskDate, toBrDate } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterEvent'>;

/** Cadastro e edição de evento, com o mesmo fluxo de validação do original. */
export default function RegisterEvent({ navigation, route }: Props) {
  const editing = route.params?.event;

  const [name, setName] = useState(editing?.name ?? '');
  const [hour, setHour] = useState(editing?.hour ?? '');
  const [address, setAddress] = useState(editing?.address ?? '');
  const [description, setDescription] = useState(
    editing ? htmlToPlainText(editing.description) : '',
  );
  const [startDate, setStartDate] = useState(toBrDate(editing?.date));
  const [endDate, setEndDate] = useState(toBrDate(editing?.date_final));
  const [latitude, setLatitude] = useState(String(editing?.locations?.[0]?.latitude ?? ''));
  const [longitude, setLongitude] = useState(String(editing?.locations?.[0]?.longitude ?? ''));
  const [categories, setCategories] = useState<Category[]>(editing?.categories ?? []);
  const [contacts, setContacts] = useState<Contact[]>(
    editing?.contacts?.filter((contact) => contact.value) ?? [],
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(editing?.tags ?? []);
  const [imageUri, setImageUri] = useState<string | null>(editing?.image?.url ?? null);
  const [imageChanged, setImageChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    GetAllTags()
      .then(setAvailableTags)
      .catch(async () => setAvailableTags((await storage.getTags()) ?? []));
  }, []);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Atenção', 'Preciso da tua permissão para acessar as fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled) return;
    setImageUri(result.assets[0].uri);
    setImageChanged(true);
  }

  function toggleTag(tag: Tag) {
    setSelectedTags((current) =>
      current.some((item) => item.name === tag.name)
        ? current.filter((item) => item.name !== tag.name)
        : [...current, tag],
    );
  }

  function validate(): string | null {
    if (!name.trim()) return 'O nome do evento é obrigatório.';
    if (!startDate) return 'Informe a data inicial do evento.';
    if (!latitude || !longitude) return 'É necessário a localização.';
    if (selectedTags.length === 0) return 'É necessário escolher pelo menos 1 tipo de evento.';
    if (categories.length === 0) return 'É necessário escolher pelo menos 1 categoria';
    if (!imageUri) return 'É necessário fazer o upload da imagem.';
    return null;
  }

  async function save() {
    const error = validate();
    if (error) {
      Alert.alert('Atenção', error);
      return;
    }

    if (contacts.length === 0) {
      Alert.alert('Atenção', 'Você não cadastrou nenhum contato. Deseja continuar?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: submit },
      ]);
      return;
    }

    submit();
  }

  async function submit() {
    setSaving(true);
    try {
      let image = imageUri!;
      if (imageChanged) {
        const uploaded = await SendImageToServer({ uri: imageUri! });
        image = uploaded.url;
      }

      const payload = {
        id: editing?.id,
        name: name.trim(),
        description,
        date: formatDate(startDate),
        date_final: formatDate(endDate || startDate),
        locations: [{ latitude, longitude }],
        address: address.trim(),
        categories: categories.map((category) => category.id),
        hour,
        tags: selectedTags,
        contacts,
        image,
      };

      if (editing) {
        await UpdateEvent(payload);
      } else {
        await CreateEvent(payload);
      }

      Alert.alert('Evento cadastrado com sucesso!', '', [
        { text: 'Ok', onPress: navigation.goBack },
      ]);
    } catch {
      Alert.alert('Atenção', 'Ocorreu um erro ao cadastrar evento');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!editing) return;

    Alert.alert(
      'Atenção',
      'Deseja realmente deletar este evento? Depois de deletado não há como recuperar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, quero deletar!',
          style: 'destructive',
          onPress: async () => {
            try {
              await DeleteEvent(editing.id);
              Alert.alert('Evento deletado com sucesso!', '', [
                { text: 'Ok', onPress: navigation.goBack },
              ]);
            } catch {
              Alert.alert('Atenção', 'Ocorreu um erro ao deletar evento');
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title={editing ? 'EDITAR EVENTO' : 'CADASTRAR EVENTO'}
        onBack={navigation.goBack}
        right={
          editing ? (
            <TouchableOpacity onPress={confirmDelete} hitSlop={12}>
              <Ionicons name="trash-outline" size={24} color={COLORS.COLOR_MAIN} />
            </TouchableOpacity>
          ) : null
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={38} color={COLORS.GRAY} />
                <Text style={styles.imageLabel}>UPLOAD IMAGEM</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Nome do evento</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Horário</Text>
          <TextInput
            style={styles.input}
            value={hour}
            onChangeText={setHour}
            placeholder="18:00-23:00"
            placeholderTextColor={COLORS.GRAY}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Data Inicial</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                keyboardType="number-pad"
                onChangeText={(value) => setStartDate(maskDate(value))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={COLORS.GRAY}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Data Final</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                keyboardType="number-pad"
                onChangeText={(value) => setEndDate(maskDate(value))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={COLORS.GRAY}
              />
            </View>
          </View>

          <Text style={styles.label}>Endereço</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.selector}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Maps', {
                latitude,
                longitude,
                onConfirm: (coords) => {
                  setLatitude(coords.latitude);
                  setLongitude(coords.longitude);
                },
              })
            }
          >
            <Ionicons name="location-outline" size={20} color={COLORS.COLOR_MAIN} />
            <Text style={styles.selectorText}>
              {latitude ? `${latitude}, ${longitude}` : 'Adicionar localização'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>

          <Text style={styles.label}>Marque em qual tipo o seu evento se encaixa</Text>
          <View style={styles.tags}>
            {availableTags.map((tag) => {
              const active = selectedTags.some((item) => item.name === tag.name);
              return (
                <TouchableOpacity
                  key={tag.name}
                  style={[styles.tag, active ? styles.tagActive : null]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tagText, active ? styles.tagTextActive : null]}>
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.selector}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('CategoriesByRegister', {
                selected: categories,
                onConfirm: setCategories,
              })
            }
          >
            <Ionicons name="grid-outline" size={20} color={COLORS.COLOR_MAIN} />
            <Text style={styles.selectorText}>
              {categories.length
                ? `Categorias: ${categories.map((item) => item.name).join(', ')}`
                : 'SELECIONAR CATEGORIAS'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selector}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('ContactsByRegister', {
                selected: contacts,
                onConfirm: (result) => setContacts(result as Contact[]),
              })
            }
          >
            <Ionicons name="call-outline" size={20} color={COLORS.COLOR_MAIN} />
            <Text style={styles.selectorText}>
              {contacts.length
                ? `Contatos: ${contacts.map((item) => item.type).join(', ')}`
                : 'ADICIONAR CONTATOS'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submit}
            onPress={save}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.submitText}>Quero cadastrar</Text>
            )}
          </TouchableOpacity>

          {saving ? <Text style={styles.hint}>Aguarde um instante...</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { padding: 16 },
  flex: { flex: 1 },
  hint: { color: COLORS.GRAY, fontSize: 13, marginTop: 12, textAlign: 'center' },
  image: { height: '100%', width: '100%' },
  imageLabel: { color: COLORS.GRAY, fontSize: 13, fontWeight: 'bold', marginTop: 8 },
  imagePicker: {
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    height: 180,
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.BLACK,
    fontSize: 15,
    height: 48,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  label: { color: COLORS.GRAY, fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  selector: {
    alignItems: 'center',
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectorText: { color: COLORS.BLACK, flex: 1, fontSize: 14, marginLeft: 10 },
  submit: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: 10,
  },
  submitText: { color: COLORS.WHITE, fontSize: 16, fontWeight: 'bold' },
  tag: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 16,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagActive: { backgroundColor: COLORS.COLOR_MAIN },
  tagText: { color: COLORS.BLACK, fontSize: 12, fontWeight: 'bold' },
  tagTextActive: { color: COLORS.WHITE },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  textArea: { height: 130, paddingTop: 12 },
});
