import { revalidatePath, updateTag } from 'next/cache'

import { ETIQUETA_COLECOES, ETIQUETA_CONFIGURACOES, ETIQUETA_PECAS } from '../dados/consultas'

export interface ResultadoAcao {
  ok: boolean
  erro?: string
  /** Devolvido no cadastro, para a tela abrir a edição da peça nova. */
  id?: string
}

const ETIQUETAS = { pecas: ETIQUETA_PECAS, colecoes: ETIQUETA_COLECOES, configuracoes: ETIQUETA_CONFIGURACOES }

/**
 * Depois de salvar, o site mostra a mudança na hora.
 *
 * `updateTag`, e não `revalidateTag`: o segundo ainda serve a versão velha
 * uma vez enquanto busca a nova por trás, e para quem acabou de salvar ver o
 * valor antigo parece que o salvamento falhou. `revalidatePath` do layout
 * refaz as páginas estáticas (o início, as páginas das peças).
 */
export function revalidarSite(...o: (keyof typeof ETIQUETAS)[]) {
  for (const chave of o) updateTag(ETIQUETAS[chave])
  revalidatePath('/', 'layout')
}
