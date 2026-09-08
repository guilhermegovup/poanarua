/**
 * Trava simples de interface para a área restrita (/adm).
 *
 * Não é segurança de verdade: quem protege os dados são as policies do banco.
 * Serve para esconder o webadmin de quem só descobriu a URL.
 */
const KEY = "poa-na-rua:adm";
const PASSPHRASE = "Mia@2026";

export function isAdmUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function tryUnlockAdm(input: string): boolean {
  if (input !== PASSPHRASE) return false;
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* storage bloqueado: segue liberado só nesta navegação */
  }
  return true;
}

export function lockAdm(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nada a fazer */
  }
}
