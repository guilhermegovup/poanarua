import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-events";
import type { Contact, ContactType, EventItem, EventPayload, Tag } from "@/data/types";
import { tags as allTags } from "@/data/seed";
import { htmlToPlainText } from "@/lib/html";
import { cn } from "@/lib/utils";

const CONTACT_FIELDS: { type: ContactType; label: string; placeholder: string }[] = [
  { type: "site", label: "Site", placeholder: "https://..." },
  { type: "instagram", label: "Instagram", placeholder: "@perfil" },
  { type: "whatsapp", label: "WhatsApp", placeholder: "(51) 99999-9999" },
];

export interface EventFormValues extends EventPayload {
  image?: string;
}

/** "2026-10-12T15:00:00Z" -> "2026-10-12", para o input date. */
function toInputDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toIso(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

interface Props {
  event?: EventItem;
  submitLabel: string;
  onSubmit: (values: EventFormValues) => Promise<void>;
}

/** Formulário compartilhado entre criar e editar evento no webadmin. */
export function EventForm({ event, submitLabel, onSubmit }: Props) {
  const { data: categories = [] } = useCategories();

  const [name, setName] = useState(event?.name ?? "");
  const [description, setDescription] = useState(event ? htmlToPlainText(event.description) : "");
  const [address, setAddress] = useState(event?.address ?? "");
  const [startDate, setStartDate] = useState(toInputDate(event?.date));
  const [endDate, setEndDate] = useState(toInputDate(event?.date_final));
  const [hour, setHour] = useState(event?.hour ?? "");
  const [image, setImage] = useState(event?.image.url ?? "");
  const [latitude, setLatitude] = useState(String(event?.locations?.[0]?.latitude ?? ""));
  const [longitude, setLongitude] = useState(String(event?.locations?.[0]?.longitude ?? ""));
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    event?.categories.map((category) => category.id) ?? [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    event?.tags.map((tag) => tag.name) ?? [],
  );
  const [contacts, setContacts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      CONTACT_FIELDS.map((field) => [
        field.type,
        event?.contacts.find((contact) => contact.type === field.type)?.value ?? "",
      ]),
    ),
  );
  const [saving, setSaving] = useState(false);

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!name.trim()) {
      toast("O nome do evento é obrigatório.");
      return;
    }
    if (!startDate) {
      toast("Informe a data inicial do evento.");
      return;
    }
    if (selectedCategories.length === 0) {
      toast("Escolhe pelo menos 1 categoria.");
      return;
    }

    const payloadContacts: Contact[] = CONTACT_FIELDS.flatMap((field) => {
      const value = contacts[field.type]?.trim();
      return value ? [{ type: field.type, value }] : [];
    });

    const values: EventFormValues = {
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      date: toIso(startDate),
      date_final: toIso(endDate || startDate),
      hour: hour.trim(),
      locations: latitude && longitude ? [{ latitude, longitude }] : [],
      categories: selectedCategories,
      tags: allTags.filter((tag) => selectedTags.includes(tag.name)) as Tag[],
      contacts: payloadContacts,
    };

    const cover = image.trim();
    if (cover) values.image = cover;

    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do evento *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="start">Data inicial *</Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">Data final</Label>
          <Input
            id="end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hour">Horário</Label>
          <Input
            id="hour"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="13:00-21:00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="-30.0346"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lon">Longitude</Label>
          <Input
            id="lon"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-51.2177"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Link da imagem</Label>
        <Input id="image" type="url" value={image} onChange={(e) => setImage(e.target.value)} />
        {image && (
          <img src={image} alt="" className="mt-2 h-40 w-full rounded-lg object-cover sm:w-80" />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-40"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Categorias *</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category.id}
              active={selectedCategories.includes(category.id)}
              onClick={() =>
                setSelectedCategories((current) =>
                  current.includes(category.id)
                    ? current.filter((item) => item !== category.id)
                    : [...current, category.id],
                )
              }
            >
              {category.name}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Tags</legend>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Chip
              key={tag.name}
              active={selectedTags.includes(tag.name)}
              onClick={() =>
                setSelectedTags((current) =>
                  current.includes(tag.name)
                    ? current.filter((item) => item !== tag.name)
                    : [...current, tag.name],
                )
              }
            >
              {tag.name}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Contatos</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          {CONTACT_FIELDS.map((field) => (
            <div key={field.type} className="space-y-2">
              <Label htmlFor={field.type} className="text-xs">
                {field.label}
              </Label>
              <Input
                id={field.type}
                value={contacts[field.type] ?? ""}
                onChange={(e) =>
                  setContacts((current) => ({ ...current, [field.type]: e.target.value }))
                }
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={saving}>
        {saving ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-bold transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
