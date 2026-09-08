import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { LoginRequired } from '~/components/shared';
import { DeleteImageGallery, GetImagesEvent, SendImageEvent } from '~/services';
import { COLORS } from '~/styles';
import type { EventItem, GalleryImage } from '~/types';
import { allowedUser } from '~/utils';

interface Props {
  event: EventItem;
  onRequireLogin: () => void;
}

/** Galeria colaborativa do evento: qualquer pessoa logada pode somar fotos. */
export function Gallery({ event, onRequireLogin }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [warning, setWarning] = useState(false);

  const load = useCallback(async () => {
    try {
      setImages(await GetImagesEvent(event.id));
    } catch {
      setImages([]);
    }
  }, [event.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function pickImage() {
    if (!(await allowedUser())) {
      setWarning(true);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Atenção', 'Preciso da tua permissão para acessar as fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    try {
      await SendImageEvent({
        event_id: event.id,
        file: {
          uri: asset.uri,
          name: asset.fileName ?? 'foto.jpg',
          type: asset.mimeType ?? 'image/jpeg',
        },
      });
      await load();
    } catch {
      Alert.alert('Atenção', 'deu erro ao enviar imagem');
    }
  }

  function confirmDelete(image: GalleryImage) {
    Alert.alert('Excluir Imagem', 'Deseja realmente excluir a imagem selecionada?', [
      { text: 'NÃO', style: 'cancel' },
      {
        text: 'SIM',
        onPress: async () => {
          try {
            await DeleteImageGallery(image.id);
            await load();
          } catch {
            Alert.alert('Atenção', 'Erro ao tentar deletar imagem da galeria');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GALERIA</Text>
        <TouchableOpacity onPress={pickImage} hitSlop={12}>
          <Ionicons name="camera-outline" size={24} color={COLORS.COLOR_MAIN} />
        </TouchableOpacity>
      </View>

      {images.length === 0 ? (
        <Text style={styles.empty}>Sem imagens!</Text>
      ) : (
        <FlatList
          horizontal
          data={images}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity onLongPress={() => confirmDelete(item)} activeOpacity={0.85}>
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />
      )}

      <LoginRequired
        visible={warning}
        message="Para acessar esse recurso, é necessário estar logado."
        onDismiss={() => setWarning(false)}
        onLogin={onRequireLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15, paddingVertical: 10 },
  empty: { color: COLORS.GRAY, fontSize: 13 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  image: { borderRadius: 8, height: 100, marginRight: 10, width: 100 },
  title: { color: COLORS.GRAY, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
});

export default Gallery;
