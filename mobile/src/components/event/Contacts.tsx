import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '~/styles';
import type { Contact } from '~/types';
import { CONTACT_ICON, contactUrl, openUrl } from '~/utils';

export function Contacts({ contacts }: { contacts: Contact[] }) {
  const withValue = contacts.filter((contact) => contact.value.trim().length > 0);
  if (!withValue.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONTATOS</Text>
      <View style={styles.row}>
        {withValue.map((contact) => (
          <TouchableOpacity
            key={`${contact.type}-${contact.value}`}
            style={styles.button}
            onPress={() => openUrl(contactUrl(contact))}
            activeOpacity={0.8}
          >
            <Ionicons
              name={CONTACT_ICON[contact.type] as never}
              size={24}
              color={COLORS.COLOR_MAIN}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  container: { paddingHorizontal: 15, paddingVertical: 10 },
  row: { flexDirection: 'row' },
  title: {
    color: COLORS.GRAY,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
});

export default Contacts;
