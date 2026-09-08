import { Link } from "@tanstack/react-router";

import { Brand } from "@/components/layout/brand";
import { CONTACT } from "@/data/config";
import { support } from "@/lib/links";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Brand />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Cidade feliz, ruas cheias, cultura pulsante. Tudo que acontece em Porto Alegre, todos os
            dias, em um só lugar.
          </p>
        </div>

        <nav className="text-sm">
          <h2 className="mb-3 font-bold">Navegar</h2>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link to="/" className="-my-1 inline-block py-1 hover:text-foreground">
                Início
              </Link>
            </li>
            <li>
              <Link to="/busca" className="-my-1 inline-block py-1 hover:text-foreground">
                Buscar eventos
              </Link>
            </li>
            <li>
              <Link to="/favoritos" className="-my-1 inline-block py-1 hover:text-foreground">
                Meus favoritos
              </Link>
            </li>
            <li>
              <Link
                to="/cadastrar-evento"
                className="-my-1 inline-block py-1 hover:text-foreground"
              >
                Cadastrar evento
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="text-sm">
          <h2 className="mb-3 font-bold">Contato</h2>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <a
                href={support.whatsapp}
                className="-my-1 inline-block py-1 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={support.instagram}
                className="-my-1 inline-block py-1 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={support.facebook}
                className="-my-1 inline-block py-1 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            </li>
            <li>
              <a href={support.email} className="-my-1 inline-block py-1 hover:text-foreground">
                {CONTACT.EMAIL}
              </a>
            </li>
          </ul>
        </nav>

        <nav className="text-sm">
          <h2 className="mb-3 font-bold">Mais</h2>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link to="/sobre" className="-my-1 inline-block py-1 hover:text-foreground">
                Sobre o projeto
              </Link>
            </li>
            <li>
              <a
                href={CONTACT.TERMS}
                className="-my-1 inline-block py-1 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                Termos de uso
              </a>
            </li>
            <li>
              <a
                href={CONTACT.PRIVACY}
                className="-my-1 inline-block py-1 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                Política de privacidade
              </a>
            </li>
            <li>
              <a
                href={CONTACT.PLAY_STORE}
                className="-my-1 inline-block py-1 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                App para Android
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Foi por nós. É por todos nós ♥ — Porto Alegre
      </div>
    </footer>
  );
}
