import { createFileRoute } from "@tanstack/react-router";

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
    <main className="flex min-h-screen items-center justify-center px-6">
      <h1 className="text-4xl font-medium tracking-tight text-foreground">
        poa na rua
      </h1>
    </main>
  );
}
