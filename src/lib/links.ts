import { CONTACT } from "@/data/config";
import type { Contact, ContactType, EventLocation } from "@/data/types";

/** Monta a URL pública a partir do que o organizador digitou no cadastro. */
export function contactUrl(contact: Contact): string {
  const value = contact.value.trim();
  if (!value) return "";

  switch (contact.type) {
    case "facebook":
      return value.startsWith("http") ? value : `https://www.facebook.com/${value}`;
    case "instagram":
      return value.startsWith("http")
        ? value
        : `https://www.instagram.com/${value.replace(/^@/, "")}`;
    case "whatsapp":
      return value.startsWith("http")
        ? value
        : `https://api.whatsapp.com/send?phone=55${value.replace(/\D/g, "")}`;
    case "site":
    default:
      return value.startsWith("http") ? value : `https://${value}`;
  }
}

export const CONTACT_LABEL: Record<ContactType, string> = {
  site: "Site",
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
};

export function googleMapsUrl(location: EventLocation): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
}

export function wazeUrl(location: EventLocation): string {
  return `https://www.waze.com/ul?ll=${location.latitude},${location.longitude}&navigate=yes`;
}

/** Mapa estático do OpenStreetMap — não exige chave de API. */
export function staticMapUrl(location: EventLocation): string {
  const { latitude, longitude } = location;
  const delta = 0.006;
  const bbox = [
    Number(longitude) - delta,
    Number(latitude) - delta,
    Number(longitude) + delta,
    Number(latitude) + delta,
  ].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export const support = {
  whatsapp: `https://api.whatsapp.com/send?phone=${CONTACT.WHATSAPP}&text=${encodeURIComponent(
    "Bem-vindo ao Poa na Rua! Em que posso ajudar?",
  )}`,
  email: `mailto:${CONTACT.EMAIL}?subject=${encodeURIComponent("Suporte Poa Na Rua")}`,
  instagram: `https://instagram.com/${CONTACT.INSTAGRAM}`,
  facebook: `https://www.facebook.com/${CONTACT.FACEBOOK}`,
};

export function shareEvent(event: { id: number; name: string }) {
  const url = `${typeof window !== "undefined" ? window.location.origin : CONTACT.SITE}/evento/${event.id}`;
  const text = `E ai Bora?  ${event.name}`;

  if (typeof navigator !== "undefined" && navigator.share) {
    return navigator.share({ title: event.name, text, url }).catch(() => undefined);
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(`${text}\n${url}`);
  }

  return Promise.resolve();
}
