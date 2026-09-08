import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import emailIcon from '~/assets/icons/about_email.png';
import facebookIcon from '~/assets/icons/about_facebook.png';
import instagramIcon from '~/assets/icons/about_instagram.png';
import whatsappIcon from '~/assets/icons/about_whatsapp.png';
import logo from '~/assets/logo_poa.png';
import { ScreenHeader } from '~/components/shared';
import type { RootStackParamList } from '~/navigation/types';
import { COLORS } from '~/styles';
import { support } from '~/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

/** Texto institucional do app, mantido igual ao da versão publicada. */
const PARAGRAPHS = [
  'Quando a gente saía em busca das feiras pela cidade, estávamos procurando música, gente, bazar e relax pelas ruas da Capital. Foi em uma delas que encontramos também quem organizava a função e conversa vai conversa vem, começamos a listar tudo que a gente sabia. Nascia ali a nossa missão.',
  'Em 2018, Gui transformou nossa lista em um aplicativo e Thi criou o instagram para todo mundo acompanhar o que acontecia na cidade. Começamos a mapear o movimento das feiras de rua que estava iniciando por aqui, íamos em todas! Fizemos amigos, demos risadas, curtimos as praças, conhecemos novas pessoas (também boas comidas/cervejas artesanais) e principalmente sentimos a segurança de estarmos rodeados de gente no meio das nossas ruas.',
  'Foi então que começamos a crescer! Muita gente seguiu o nosso perfil e baixou o nosso aplicativo com a programação completa e em tempo real de todos os eventos de rua, feiras, lugares turísticos, cafés, bares, shows e tudo de melhor que tá acontecendo na cidade!',
  'A tomada dos espaços públicos, a interação da comunidade com a cultura urbana, o fortalecimento da relação de consumo local e a melhora da qualidade de vida de todos nós nos impulsiona! Estar aqui nos orgulha demais!',
  'Cidade feliz, ruas cheias, cultura pulsante, amizades fáceis, qualidade de vida, arte, comida, arquitetura, poesia, música, vida na rua, rua e rua - 24h por dia. Esse é o nosso lema!',
];

const CONTACTS = [
  { icon: whatsappIcon, label: 'Whatsapp', onPress: support.whatsapp },
  { icon: instagramIcon, label: 'Instagram', onPress: support.instagram },
  { icon: facebookIcon, label: 'Facebook', onPress: support.facebook },
  { icon: emailIcon, label: 'Email', onPress: support.email },
];

export default function About({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Sobre Poa na Rua" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        {PARAGRAPHS.map((paragraph) => (
          <Text key={paragraph.slice(0, 24)} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        <Text style={styles.motto}>Aproveita a tua cidade!</Text>
        <Text style={styles.motto}>Foi por nós. É por todos nós ♥</Text>

        <Text style={styles.sectionTitle}>Entre em contato</Text>

        {CONTACTS.map((contact) => (
          <TouchableOpacity
            key={contact.label}
            style={styles.contact}
            onPress={contact.onPress}
            activeOpacity={0.8}
          >
            <Image source={contact.icon} style={styles.contactIcon} resizeMode="contain" />
            <Text style={styles.contactLabel}>{contact.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.rate} onPress={support.store} activeOpacity={0.85}>
          <Text style={styles.rateText}>Avalie nosso App</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>Poa na Rua · versão 2.7.1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contact: {
    alignItems: 'center',
    borderBottomColor: COLORS.BORDER_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  contactIcon: { height: 28, width: 28 },
  contactLabel: { color: COLORS.BLACK, fontSize: 15, marginLeft: 14 },
  container: { backgroundColor: COLORS.WHITE, flex: 1 },
  content: { padding: 20 },
  footer: { alignItems: 'center', marginTop: 30 },
  logo: { alignSelf: 'center', height: 110, marginBottom: 20, width: 110 },
  motto: {
    color: COLORS.COLOR_MAIN,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  paragraph: { color: COLORS.BLACK, fontSize: 14, lineHeight: 21, marginBottom: 14 },
  rate: {
    alignItems: 'center',
    backgroundColor: COLORS.COLOR_MAIN,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    marginTop: 24,
  },
  rateText: { color: COLORS.WHITE, fontSize: 15, fontWeight: 'bold' },
  sectionTitle: {
    color: COLORS.BLACK,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 28,
  },
  version: { color: COLORS.GRAY, fontSize: 12 },
});
