import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Heart, Info, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/data/api";
import { SITE } from "@/data/config";
import { store } from "@/data/store";
import { queryKeys, useMyEvents } from "@/hooks/use-events";
import { useFavoriteCount, useUser } from "@/hooks/use-store";
import { formatShortDate, initials } from "@/lib/format";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [{ title: `Meu perfil — ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useUser();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">{user ? <Profile /> : <SignIn />}</div>
    </AppShell>
  );
}

/**
 * O app original tinha login por e-mail, Facebook, Google e Apple. Aqui fica
 * só o e-mail: os logins sociais precisam de chaves de projeto próprias, e a
 * sessão local já libera favoritar, marcar presença e cadastrar evento.
 */
function SignIn() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!email.trim()) {
      toast("O campo email deve ser preenchido");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      toast("Email inválido");
      return;
    }

    store.signIn(email.trim(), name.trim() || undefined);
    toast(`Bem-vindo ao Poa na Rua${name ? `, ${name.split(" ")[0]}` : ""}!`);
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Entrar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Para favoritar, marcar presença e cadastrar teus eventos.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-border p-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Como podemos te chamar?"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
          />
        </div>

        <Button type="submit" className="w-full">
          Entrar
        </Button>

        <p className="text-xs text-muted-foreground">
          A sessão fica só neste navegador — nada é enviado para nenhum servidor enquanto a API do
          Poa na Rua estiver fora do ar.
        </p>
      </form>
    </>
  );
}

function Profile() {
  const user = useUser()!;
  const favorites = useFavoriteCount();
  const { data: myEvents = [] } = useMyEvents();
  const queryClient = useQueryClient();

  async function remove(id: number, name: string) {
    await api.deleteEvent(id);
    queryClient.invalidateQueries({ queryKey: queryKeys.myEvents });
    queryClient.invalidateQueries({ queryKey: queryKeys.events });
    toast("Evento deletado com sucesso!", { description: name });
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{user.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto shrink-0"
          onClick={() => {
            store.signOut();
            toast("Até a próxima!");
          }}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>

      <nav className="mt-8 divide-y divide-border rounded-xl border border-border">
        <Link to="/favoritos" className="flex items-center gap-3 px-4 py-4 text-sm hover:bg-accent">
          <Heart className="size-5 text-primary" />
          <span className="flex-1 font-medium">Meus eventos favoritos</span>
          <span className="text-muted-foreground">{favorites}</span>
        </Link>
        <Link
          to="/cadastrar-evento"
          className="flex items-center gap-3 px-4 py-4 text-sm hover:bg-accent"
        >
          <CalendarPlus className="size-5 text-primary" />
          <span className="flex-1 font-medium">Cadastrar evento</span>
        </Link>
        <Link to="/sobre" className="flex items-center gap-3 px-4 py-4 text-sm hover:bg-accent">
          <Info className="size-5 text-primary" />
          <span className="flex-1 font-medium">Sobre o Poa na Rua</span>
        </Link>
      </nav>

      <h2 className="mt-10 text-lg font-bold">Meus eventos cadastrados</h2>

      <div className="mt-4 space-y-3">
        {myEvents.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="Não há eventos cadastrados."
            description="Cadastra o teu rolê e aparece pra cidade inteira."
            action={{ to: "/cadastrar-evento", label: "Cadastrar evento" }}
          />
        ) : (
          myEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <img
                src={event.image.url}
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to="/evento/$id"
                  params={{ id: String(event.id) }}
                  className="line-clamp-1 font-medium hover:underline"
                >
                  {event.name}
                </Link>
                <p className="text-xs text-muted-foreground">{formatShortDate(event.date)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Excluir ${event.name}`}
                onClick={() => remove(event.id, event.name)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
