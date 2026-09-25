'use server'

import { revalidatePath } from 'next/cache'

import { LIMITE_ETIQUETA } from '../../../lib/admin/peca'
import type { ResultadoAcao } from '../../../lib/admin/revalidar'
import { clienteServidor } from '../../../lib/supabase/servidor'

/**
 * O CATÁLOGO DE ETIQUETAS.
 * ========================
 *
 * São as sugestões que aparecem no campo "Etiqueta" da peça ("Novidade",
 * "Última peça"). Mexer aqui não altera nenhuma peça: o selo da peça é texto
 * solto, e apagar uma sugestão não tira o selo de quem já usa.
 */

function validar(texto: string): string | null {
  const limpo = texto.trim()
  if (!limpo) return 'Escreva a etiqueta antes de salvar.'
  if (limpo.length > LIMITE_ETIQUETA) return `A etiqueta precisa caber no canto da foto: até ${LIMITE_ETIQUETA} letras.`
  return null
}

const revalidar = () => {
  revalidatePath('/admin/etiquetas')
  revalidatePath('/admin/pecas')
}

export async function criarEtiqueta(texto: string): Promise<ResultadoAcao> {
  const problema = validar(texto)
  if (problema) return { ok: false, erro: problema }

  const supabase = await clienteServidor()
  const { data: ultima } = await supabase.from('etiquetas').select('ordem').order('ordem', { ascending: false }).limit(1).maybeSingle()
  const { error } = await supabase.from('etiquetas').insert({ texto: texto.trim(), ordem: ((ultima?.ordem as number | undefined) ?? 0) + 1 })
  if (error) return { ok: false, erro: error.message.includes('duplicate') ? 'Essa etiqueta já está na lista.' : 'Não foi possível salvar.' }
  revalidar()
  return { ok: true }
}

export async function renomearEtiqueta(id: string, texto: string): Promise<ResultadoAcao> {
  const problema = validar(texto)
  if (problema) return { ok: false, erro: problema }
  const supabase = await clienteServidor()
  const { error } = await supabase.from('etiquetas').update({ texto: texto.trim() }).eq('id', id)
  if (error) return { ok: false, erro: error.message.includes('duplicate') ? 'Essa etiqueta já está na lista.' : 'Não foi possível salvar.' }
  revalidar()
  return { ok: true }
}

export async function excluirEtiqueta(id: string): Promise<ResultadoAcao> {
  const supabase = await clienteServidor()
  const { error } = await supabase.from('etiquetas').delete().eq('id', id)
  if (error) return { ok: false, erro: 'Não foi possível apagar.' }
  revalidar()
  return { ok: true }
}
