import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { runAll } from "./run";
import type { IngestResult } from "./types";

/**
 * A coleta roda no servidor, não no navegador.
 *
 * Buscar as fontes pelo browser esbarraria em CORS — nenhum portal de eventos
 * libera leitura cross-origin — e ainda exporia o robô como se fosse a pessoa
 * navegando. No servidor, o `fetch` é direto e o User-Agent identifica o bot.
 */
export const collectEvents = createServerFn({ method: "POST" })
  .validator(
    z.object({
      /** Fontes a visitar; vazio significa todas. */
      sourceIds: z.array(z.string()).optional(),
      /** Chaves de dedupe que a base já tem. */
      knownKeys: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }): Promise<IngestResult[]> => {
    const options: Parameters<typeof runAll>[0] = {
      knownKeys: new Set(data.knownKeys ?? []),
    };
    if (data.sourceIds?.length) options.sourceIds = data.sourceIds;

    return runAll(options);
  });
