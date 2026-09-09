import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { InstallInvite } from "@/components/layout/install-invite";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Casca comum das páginas: cabeçalho, conteúdo, rodapé e tabs no celular. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <OfflineBanner />
      {/* Espaço para a barra inferior e a área segura do aparelho; some no
          desktop, onde a barra não existe. */}
      <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
      <InstallInvite />
    </div>
  );
}
