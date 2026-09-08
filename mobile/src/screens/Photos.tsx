import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Photos'>;

/** Formulário de envio de fotos (mesmo JotForm da versão publicada). */
const FORM_URL = 'https://form.jotform.com/203314003624035';

export default function Photos({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Manda tua foto" onBack={navigation.goBack} />
      <WebView
        source={{ uri: FORM_URL }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={COLORS.COLOR_MAIN} size="large" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
