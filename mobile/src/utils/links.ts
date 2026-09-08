import { Alert, Linking, Platform, Share } from 'react-native';

import { CONTACT } from '~/config';
import type { Contact, ContactType, EventLocation } from '~/types';

export async function openUrl(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Atenção', `Não consegui abrir este link:\n${url}`);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Atenção', 'Não consegui abrir este link agora.');
  }
}

/** Monta a URL pública a partir do que o organizador digitou no cadastro. */
export function contactUrl(contact: Contact): string {
  const value = contact.value.trim();
  if (!value) return '';

  switch (contact.type) {
    case 'facebook':
      return value.startsWith('http') ? value : `https://www.facebook.com/${value}`;
    case 'instagram':
      return value.startsWith('http') ? value : `https://www.instagram.com/${value}`;
    case 'whatsapp':
      return value.startsWith('http')
        ? value
        : `https://api.whatsapp.com/send?phone=55${value.replace(/\D/g, '')}`;
    case 'site':
    default:
      return value.startsWith('http') ? value : `https://${value}`;
  }
}

export const CONTACT_ICON: Record<ContactType, string> = {
  site: 'globe-outline',
  facebook: 'logo-facebook',
  instagram: 'logo-instagram',
  whatsapp: 'logo-whatsapp',
};

export function shareEvent(event: { id: number; name: string }) {
  return Share.share({
    title: 'Compartilhar Evento',
    message: `E ai Bora?  ${event.name}\nhttps://poanarua.com.br/#/evento/${event.id}`,
  });
}

export function mapsUrl(location: EventLocation, label = 'Evento') {
  const { latitude, longitude } = location;
  return Platform.select({
    ios: `maps://app?daddr=${latitude},${longitude}&q=${encodeURIComponent(label)}`,
    default: `google.navigation:q=${latitude},${longitude}`,
  }) as string;
}

export function googleMapsWebUrl(location: EventLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
}

export function wazeUrl(location: EventLocation) {
  return `https://www.waze.com/ul?ll=${location.latitude},${location.longitude}&navigate=yes`;
}

export const support = {
  email: () =>
    openUrl(`mailto:${CONTACT.EMAIL}?subject=${encodeURIComponent('Suporte Poa Na Rua')}`),
  whatsapp: () =>
    openUrl(
      `https://api.whatsapp.com/send?phone=${CONTACT.WHATSAPP.replace(/\D/g, '')}&text=${encodeURIComponent(
        'Bem-vindo ao Poa na Rua! Em que posso ajudar?',
      )}`,
    ),
  instagram: () => openUrl(`https://instagram.com/${CONTACT.INSTAGRAM}`),
  facebook: () => openUrl(`https://www.facebook.com/${CONTACT.FACEBOOK}`),
  store: () => openUrl(CONTACT.PLAY_STORE),
  terms: () => openUrl(CONTACT.TERMS),
  privacy: () => openUrl(CONTACT.PRIVACY),
};
