import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/data/api";
import { SITE } from "@/data/config";
import { queryKeys, useCategories, useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import type { Contact, ContactType, EventPayload, Tag } from "@/data/types";

export const Route = createFileRoute("/cadastrar-evento")({
  head: () => ({
    meta: [
      { title: `Cadastrar evento — ${SITE.name}` },
      {
        name: "description",
        content: "Coloque a tua feira, show ou rolê de rua no mapa do Poa na Rua. É de graça.",
      },
    ],
  }),
  component: RegisterEventPage,
});

const TAGS: Tag[] = [
  { name: "FEIRA DE RUA" },
  { name: "FESTAS" },
  { name: "SHOW" },
  { name: "RESTAURANTE" },
  { name: "AO AR LIVRE" },
  { name: "GRATUITO" },
  { name: "PET FRIENDLY" },
  { name: "PARA CRIANÇAS" },
];

const CONTACT_FIELDS: { type: ContactType; label: string; placeholder: string }[] = [
  { type: "site", label: "Site", placeholder: "poanarua.com.br" },
  { type: "instagram", label: "Instagram", placeholder: "@perfil" },
  { type: "whatsapp", label: "WhatsApp", placeholder: "(51) 99999-9999" },
];

/** "2026-10-12" -> ISO, o formato que o POST /event espera. */
function toIso(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function RegisterEventPage() {
  const user = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  useEvents();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [image, setImage] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "O nome do evento é obrigatório.";
    if (!startDate) return "Informe a data inicial do evento.";
    if (!address.trim()) return "Informe o endereço do evento.";
    if (selectedTags.length === 0) return "É necessário escolher pelo menos 1 tipo de evento.";
    if (selectedCategories.length === 0) return "É necessário escolher pelo menos 1 categoria.";
    return null;
  }

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!user) {
      toast("Para cadastrar um evento, entra na tua conta.", {
        action: { label: "Entrar", onClick: () => navigate({ to: "/perfil" }) },
      });
      return;
    }

    const error = validate();
    if (error) {
      toast(error);
      return;
    }

    setSaving(true);
    try {
      const payloadContacts: Contact[] = CONTACT_FIELDS.flatMap((field) => {
        const value = contacts[field.type]?.trim();
        return value ? [{ type: field.type, value }] : [];
      });

      const payload: EventPayload & { image?: string } = {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        date: toIso(startDate),
        date_final: toIso(endDate || startDate),
        hour: startHour ? `${startHour}${endHour ? `-${endHour}` : ""}` : "",
        locations: [],
        categories: selectedCategories,
        tags: TAGS.filter((tag) => selectedTags.includes(tag.name)),
        contacts: payloadContacts,
      };

      const cover = image.trim();
      if (cover) payload.image = cover;

      const created = await api.createEvent(payload);

      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.myEvents });

      toast("Evento cadastrado com sucesso!");
      navigate({ to: "/evento/$id", params: { id: String(created.id) } });
    } catch {
      toast("Ocorreu um erro ao cadastrar evento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cadastrar evento</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Feira, show, bazar, sarau — é de graça e aparece pra cidade inteira.
        </p>

        {!user && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-accent p-4 text-sm">
            Entra na tua conta para publicar o evento.{" "}
            <button
              type="button"
              className="font-bold text-primary underline"
              onClick={() => navigate({ to: "/perfil" })}
            >
              Entrar agora
            </button>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do evento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Feira Me Gusta na Praça Garibaldi"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data inicial *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-hour">Começa às</Label>
              <Input
                id="start-hour"
                type="time"
                value={startHour}
                onChange={(event) => setStartHour(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-hour">Termina às</Label>
              <Input
                id="end-hour"
                type="time"
                value={endHour}
                onChange={(event) => setEndHour(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Praça Garibaldi - Cidade Baixa, Porto Alegre"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Conta o que vai rolar, quem toca, o que tem pra comer..."
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Link da imagem</Label>
            <Input
              id="image"
              type="url"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Sem imagem a gente gera uma capa provisória.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              Marque em qual tipo o seu evento se encaixa *
            </legend>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
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
            <legend className="text-sm font-medium">
              Selecione a(s) categoria(s) que seu evento se enquadra *
            </legend>
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
            <legend className="text-sm font-medium">
              Contatos para informações sobre o evento
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              {CONTACT_FIELDS.map((field) => (
                <div key={field.type} className="space-y-2">
                  <Label htmlFor={field.type} className="text-xs">
                    {field.label}
                  </Label>
                  <Input
                    id={field.type}
                    value={contacts[field.type] ?? ""}
                    onChange={(event) =>
                      setContacts((current) => ({
                        ...current,
                        [field.type]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Cadastrando..." : "Quero cadastrar"}
          </Button>
        </form>
      </div>
    </AppShell>
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
