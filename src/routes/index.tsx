import { createFileRoute } from "@tanstack/react-router";

import logoAsset from "@/assets/logo-poa-na-rua.svg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "poa na rua" },
      { name: "description", content: "poa na rua — em breve." },
      { property: "og:title", content: "poa na rua" },
      { property: "og:description", content: "poa na rua — em breve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <img
        src={logoAsset.url}
        alt="Logo poa na rua"
        className="h-40 w-40 md:h-56 md:w-56"
      />
      <h1 className="text-4xl font-medium tracking-tight text-foreground">
        poa na rua
      </h1>
    </main>
  );
}
