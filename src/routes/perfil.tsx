import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Heart, Info, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EventImage } from "@/components/event/event-image";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/data/api";
import { signIn, signOut, signUp } from "@/data/auth";
import { SITE } from "@/data/config";
import { isRemote } from "@/data/supabase";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys, useMyEvents } from "@/hooks/use-events";
import { useFavoriteCount } from "@/hooks/use-store";
import { formatShortDate, initials } from "@/lib/format";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [{ title: `Meu perfil — ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {loading ? (
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
        ) : user ? (
          <Profile />
        ) : (
          <SignIn />
        )}
      </div>
    </AppShell>
  );
}

function SignIn() {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const erro = !email.trim()
      ? "O campo email deve ser preenchido"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
        ? "Email inválido"
        : isRemote && password.length < 6
          ? "A senha deve conter no mínimo 6 caracteres"
          : mode === "criar" && !name.trim()
            ? "Como podemos te chamar?"
            : null;

    if (erro) {
      toast(erro);
      return;
    }

    setBusy(true);
    try {
      if (mode === "criar") {
        const { needsConfirmation } = await signUp(email.trim(), password, name.trim());
        if (needsConfirmation) {
          toast("Confirma teu e-mail", {
            description: "Mandamos um link para validar a conta.",
          });
          setMode("entrar");
        } else {
          await refresh();
          toast(`Bem-vindo ao Poa na Rua, ${name.split(" ")[0]}!`);
        }
      } else {
        const session = await signIn(email.trim(), password);
        await refresh();
        toast(`Bem-vindo de volta, ${session.user.name.split(" ")[0]}!`);
      }
    } catch (error) {
      toast((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {mode === "entrar" ? "Entrar" : "Criar conta"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Para favoritar, marcar presença e cadastrar teus eventos.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-border p-5">
        {mode === "criar" && (
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos te chamar?"
              autoComplete="name"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
          />
        </div>

        {isRemote && (
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "criar" ? "new-password" : "current-password"}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "..." : mode === "entrar" ? "Entrar" : "Criar conta"}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
          className="w-full text-center text-sm text-primary hover:underline"
        >
          {mode === "entrar" ? "Ainda não tem conta? Cria a tua" : "Já tenho conta"}
        </button>

        {!isRemote && (
          <p className="text-xs text-muted-foreground">
            A sessão fica só neste navegador — o banco de dados ainda não está ligado.
          </p>
        )}
      </form>
    </>
  );
}

function Profile() {
  const { user, isAdmin, refresh } = useAuth();
  const favorites = useFavoriteCount();
  const { data: myEvents = [] } = useMyEvents();
  const queryClient = useQueryClient();

  if (!user) return null;

  async function remove(id: number, name: string) {
    await api.deleteEvent(id);
    await queryClient.invalidateQueries({ queryKey: queryKeys.myEvents });
    await queryClient.invalidateQueries({ queryKey: queryKeys.events });
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
          onClick={async () => {
            await signOut();
            await refresh();
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

        {/*
          Atalho do webadmin. Só existe para quem está na tabela `admins`, então
          é invisível para o público sem depender de esconder a URL — o /admin
          já é protegido pelas policies do banco de qualquer jeito.
        */}
        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-3 px-4 py-4 text-sm hover:bg-accent">
            <ShieldCheck className="size-5 text-primary" />
            <span className="flex-1 font-medium">Administrar eventos</span>
          </Link>
        )}
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
              <EventImage
                src={event.image.url}
                name={event.name}
                className="size-16 shrink-0 rounded-lg"
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
