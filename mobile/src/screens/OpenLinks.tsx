import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'OpenLinks'>;

/** Navegador embutido, usado para abrir links sem sair do app. */
export default function OpenLinks({ navigation, route }: Props) {
  const { url, title } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title={title ?? 'Poa na Rua'} onBack={navigation.goBack} />
      <WebView
        source={{ uri: url }}
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
