import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '~/styles';

interface Props {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  onLogin?: () => void;
}

/**
 * Aviso "é necessário estar logado", exibido quando quem está no modo anônimo
 * tenta favoritar, comentar, marcar presença ou cadastrar evento.
 */
export function LoginRequired({ visible, message, onDismiss, onLogin }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onDismiss} style={styles.button}>
              <Text style={styles.buttonGhost}>Agora não</Text>
            </TouchableOpacity>
            {onLogin ? (
              <TouchableOpacity
                onPress={() => {
                  onDismiss();
                  onLogin();
                }}
                style={[styles.button, styles.buttonPrimary]}
              >
                <Text style={styles.buttonPrimaryText}>Entrar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  backdrop: {
    alignItems: 'center',
    backgroundColor: COLORS.TRANSPARENT_70,
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  button: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  buttonGhost: { color: COLORS.GRAY, fontWeight: 'bold' },
  buttonPrimary: { backgroundColor: COLORS.COLOR_MAIN, marginLeft: 8 },
  buttonPrimaryText: { color: COLORS.WHITE, fontWeight: 'bold' },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 22,
    width: '100%',
  },
  message: { color: COLORS.BLACK, fontSize: 16, lineHeight: 22 },
});

export default LoginRequired;
