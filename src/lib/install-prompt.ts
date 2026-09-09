import { useEffect, useState } from "react";

/**
 * Convite para instalar o app.
 *
 * No Android o Chrome guarda um evento (`beforeinstallprompt`) que só pode ser
 * disparado a partir de um gesto da pessoa — daí guardá-lo e usar depois, num
 * botão nosso.
 *
 * No iPhone esse evento não existe: instalar é Compartilhar → Adicionar à Tela
 * de Início, e não há API nenhuma para pedir. Sem uma instrução escrita,
 * ninguém descobre. Para um app de rua, estar no ícone da tela inicial é o
 * produto — então vale ensinar.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "poanarua:instalar-dispensado";

/** Quanto tempo respeitar um "agora não" antes de perguntar de novo. */
const SILENCE_MS = 30 * 24 * 60 * 60 * 1000;

/** Só convida quem já voltou: na primeira visita ninguém instala nada. */
const MIN_VISITS = 2;
const VISITS_KEY = "poanarua:visitas";

export type InstallKind = "prompt" | "ios" | null;

function readNumber(key: string): number {
  try {
    return Number(localStorage.getItem(key) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Aba anônima ou armazenamento bloqueado: o convite simplesmente não
    // aparece, o que é melhor do que aparecer em toda abertura.
  }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari no iOS não implementa display-mode; usa esta propriedade própria.
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS recente se anuncia como Mac; o toque é o que o denuncia.
  return /iphone|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

export function useInstallPrompt() {
  const [kind, setKind] = useState<InstallKind>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    const visits = readNumber(VISITS_KEY) + 1;
    write(VISITS_KEY, String(visits));

    const dismissedAt = readNumber(DISMISSED_KEY);
    if (dismissedAt && Date.now() - dismissedAt < SILENCE_MS) return;
    if (visits < MIN_VISITS) return;

    if (isIos()) {
      setKind("ios");
      return;
    }

    const onPrompt = (event: Event) => {
      // Sem isto o Chrome mostra a barra dele, e aí são dois convites.
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setKind("prompt");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    write(DISMISSED_KEY, String(Date.now()));
    setKind(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    // O evento vale um disparo só; depois da escolha ele não serve mais.
    setDeferred(null);
    setKind(null);
  };

  return { kind, install, dismiss };
}
