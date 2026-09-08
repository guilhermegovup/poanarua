import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AvatarLetter, LoginRequired } from '~/components/shared';
import { GetUsersGoEvent, ImGoEvent } from '~/services';
import { storage } from '~/storage';
import { COLORS } from '~/styles';
import type { EventItem, GoEventUser } from '~/types';
import { allowedUser, sendMetricsEvent } from '~/utils';

interface Props {
  event: EventItem;
  onRequireLogin: () => void;
}

/** Botão "Eu vou" + avatares de quem confirmou presença. */
export function GoEvent({ event, onRequireLogin }: Props) {
  const [users, setUsers] = useState<GoEventUser[]>([]);
  const [warning, setWarning] = useState(false);

  const label = event.event_date ? 'Eu vou' : 'Recomendo';

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await GetUsersGoEvent(event.id));
    } catch {
      setUsers([]);
    }
  }, [event.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function toggle() {
    sendMetricsEvent({
      event_app_screen: 'GoEvent',
      action: `CK_${label}`,
      name: event.name,
      category: event.categories[0]?.id,
      id: event.id,
    });

    if (!(await allowedUser())) {
      setWarning(true);
      return;
    }

    const user = await storage.getUser();
    if (!user) return;

    try {
      await ImGoEvent(event.id, user.id);
      await loadUsers();
    } catch {
      /* mantém a lista atual */
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggle} activeOpacity={0.85}>
        <Ionicons name="hand-right" size={20} color={COLORS.WHITE} />
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>

      <FlatList
        horizontal
        data={users}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        style={styles.avatars}
        renderItem={({ item }) => (
          <View style={styles.avatar}>
            <AvatarLetter uri={item.avatar} name={item.name} size={38} />
          </View>
        )}
      />

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
  avatar: { marginRight: -8 },
  avatars: { flex: 1, marginLeft: 14 },
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 20,
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonText: { color: COLORS.WHITE, fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
});

export default GoEvent;
