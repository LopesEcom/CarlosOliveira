'use server'

import { supabaseConfigurado } from '../../lib/supabase/env'
import { clientePublico } from '../../lib/supabase/publico'

/**
 * OS NÚMEROS DO PAINEL.
 * =====================
 *
 * Cada visita a uma peça e cada clique para o WhatsApp (ou para aprender a
 * fazer a peça) viram uma linha em `eventos`. É daí que sai o "Resultados"
 * do painel: quais peças são mais vistas, quais viram conversa.
 *
 * Nunca lança, e quem chama não espera: contar não pode atrasar a abertura
 * do WhatsApp nem derrubar a página. Sem Supabase, não faz nada.
 */
export type TipoEvento = 'visita_peca' | 'clique_whatsapp' | 'clique_aprender'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function registrarEvento(tipo: TipoEvento, pecaId?: string): Promise<void> {
  if (!supabaseConfigurado()) return
  if (!['visita_peca', 'clique_whatsapp', 'clique_aprender'].includes(tipo)) return

  try {
    const { error } = await clientePublico()
      .from('eventos')
      .insert({ tipo, peca_id: pecaId && UUID.test(pecaId) ? pecaId : null })
    if (error) console.error(`Falha ao registrar "${tipo}":`, error.message)
  } catch (erro) {
    console.error(`Falha ao registrar "${tipo}":`, erro)
  }
}
