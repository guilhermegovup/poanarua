import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MessageCircle } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { CONTACT, SITE } from "@/data/config";
import { support } from "@/lib/links";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: `Sobre — ${SITE.name}` },
      {
        name: "description",
        content:
          "A história do Poa na Rua: como uma lista de feiras virou o mapa da vida de rua de Porto Alegre.",
      },
    ],
  }),
  component: AboutPage,
});

/** Texto institucional do app publicado, mantido palavra por palavra. */
const PARAGRAPHS = [
  "Quando a gente saía em busca das feiras pela cidade, estávamos procurando música, gente, bazar e relax pelas ruas da Capital. Foi em uma delas que encontramos também quem organizava a função e conversa vai conversa vem, começamos a listar tudo que a gente sabia. Nascia ali a nossa missão.",
  "Em 2018, Gui transformou nossa lista em um aplicativo e Thi criou o instagram para todo mundo acompanhar o que acontecia na cidade. Começamos a mapear o movimento das feiras de rua que estava iniciando por aqui, íamos em todas! Fizemos amigos, demos risadas, curtimos as praças, conhecemos novas pessoas (também boas comidas/cervejas artesanais) e principalmente sentimos a segurança de estarmos rodeados de gente no meio das nossas ruas.",
  "Foi então que começamos a crescer! Muita gente seguiu o nosso perfil e baixou o nosso aplicativo com a programação completa e em tempo real de todos os eventos de rua, feiras, lugares turísticos, cafés, bares, shows e tudo de melhor que tá acontecendo na cidade!",
  "A tomada dos espaços públicos, a interação da comunidade com a cultura urbana, o fortalecimento da relação de consumo local e a melhora da qualidade de vida de todos nós nos impulsiona! Estar aqui nos orgulha demais!",
  "Cidade feliz, ruas cheias, cultura pulsante, amizades fáceis, qualidade de vida, arte, comida, arquitetura, poesia, música, vida na rua, rua e rua - 24h por dia. Esse é o nosso lema!",
];

const CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp", href: support.whatsapp },
  { icon: Instagram, label: "Instagram", href: support.instagram },
  { icon: Facebook, label: "Facebook", href: support.facebook },
  { icon: Mail, label: CONTACT.EMAIL, href: support.email },
];

function AboutPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <img
          src="/logo-poa-na-rua.svg"
          alt="Poa na Rua"
          className="mx-auto size-28"
          width={112}
          height={112}
        />

        <h1 className="mt-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Sobre o Poa na Rua
        </h1>

        <div className="mt-6 space-y-4 text-sm leading-relaxed">
          {PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <p className="mt-8 text-center text-lg font-bold text-primary">Aproveita a tua cidade!</p>
        <p className="mt-1 text-center text-lg font-bold text-primary">
          Foi por nós. É por todos nós ♥
        </p>

        <h2 className="mt-12 text-lg font-bold">Entre em contato</h2>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
          {CHANNELS.map((channel) => (
            <li key={channel.label}>
              <a
                href={channel.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-3 px-4 py-4 text-sm font-medium hover:bg-accent"
              >
                <channel.icon className="size-5 text-primary" />
                {channel.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl border border-border p-5">
          <h2 className="font-bold">Prefere o app?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O Poa na Rua também está na Play Store, com notificações dos eventos que tu segue.
          </p>
          <Button asChild className="mt-4">
            <a href={CONTACT.PLAY_STORE} target="_blank" rel="noreferrer">
              Baixar para Android
            </a>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
