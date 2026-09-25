'use server'

import { validarPeca, type DadosPeca } from '../../../lib/admin/peca'
import { revalidarSite, type ResultadoAcao } from '../../../lib/admin/revalidar'
import { BUCKET } from '../../../lib/supabase/env'
import { clienteServidor } from '../../../lib/supabase/servidor'
import { SITUACOES, type Situacao } from '../../../lib/tipos'

/**
 * GRAVAR PEÇAS PELO PAINEL.
 * =========================
 *
 * Usa o cliente com sessão: o banco só aceita escrita de quem está logado
 * (ver supabase/migrations/001_esquema.sql), então uma chamada sem login
 * volta com erro em vez de gravar.
 */

/** Mensagem do Postgres traduzida para quem não é técnico. */
function traduzirErro(mensagem: string): string {
  if (mensagem.includes('pecas_numero_key')) return 'Já existe uma peça com esse número. Confira a ficha de papel.'
  if (mensagem.includes('pecas_slug_key')) return 'Já existe uma peça com esse número e esse nome.'
  if (mensagem.includes('pecas_preco_original_maior')) return 'O preço antigo precisa ser maior que o preço atual.'
  return 'Não foi possível salvar. Tente de novo em instantes.'
}

export async function criarPeca(dados: DadosPeca): Promise<ResultadoAcao> {
  const validado = validarPeca(dados)
  if (!validado.ok) return { ok: false, erro: validado.erro }

  const supabase = await clienteServidor()
  const { data, error } = await supabase.from('pecas').insert(validado.linha).select('id').single()
  if (error) return { ok: false, erro: traduzirErro(error.message) }

  revalidarSite('pecas')
  return { ok: true, id: data.id as string }
}

export async function atualizarPeca(id: string, dados: DadosPeca): Promise<ResultadoAcao> {
  const validado = validarPeca(dados)
  if (!validado.ok) return { ok: false, erro: validado.erro }

  const supabase = await clienteServidor()
  const { error } = await supabase.from('pecas').update(validado.linha).eq('id', id)
  if (error) return { ok: false, erro: traduzirErro(error.message) }

  revalidarSite('pecas')
  return { ok: true, id }
}

/** Liga e desliga direto na lista: "No site" e "Destaque". */
export async function alternarCampo(id: string, campo: 'ativo' | 'destaque', valor: boolean): Promise<ResultadoAcao> {
  const supabase = await clienteServidor()
  const { error } = await supabase
    .from('pecas')
    .update(campo === 'ativo' ? { ativo: valor } : { destaque: valor })
    .eq('id', id)
  if (error) return { ok: false, erro: 'Não foi possível salvar a mudança.' }
  revalidarSite('pecas')
  return { ok: true }
}

/**
 * Muda a situação direto na lista. É a mudança mais comum depois de uma
 * venda, e abrir o formulário inteiro para marcar "Vendida" seria castigo.
 */
export async function mudarSituacao(id: string, situacao: Situacao): Promise<ResultadoAcao> {
  if (!SITUACOES.includes(situacao)) return { ok: false, erro: 'Situação desconhecida.' }
  const supabase = await clienteServidor()
  const { error } = await supabase.from('pecas').update({ situacao }).eq('id', id)
  if (error) return { ok: false, erro: 'Não foi possível salvar a situação.' }
  revalidarSite('pecas')
  return { ok: true }
}

/** O selo da peça, direto na lista. Vazio tira o selo. */
export async function salvarEtiquetaDaPeca(id: string, etiqueta: string): Promise<ResultadoAcao> {
  const texto = etiqueta.trim()
  if (texto.length > 18) return { ok: false, erro: 'A etiqueta precisa caber no canto da foto: até 18 letras.' }
  const supabase = await clienteServidor()
  const { error } = await supabase.from('pecas').update({ etiqueta: texto || null }).eq('id', id)
  if (error) return { ok: false, erro: 'Não foi possível salvar a etiqueta.' }
  revalidarSite('pecas')
  return { ok: true }
}

/**
 * Apaga a peça e as fotos dela no Storage. As fotos saem primeiro: se a
 * linha sumisse antes, os caminhos iriam junto e os arquivos ficariam
 * perdidos no bucket. Fotos antigas (de public/, começam com "/") não são
 * do bucket e ficam.
 */
export async function excluirPeca(id: string): Promise<ResultadoAcao> {
  const supabase = await clienteServidor()
  const { data: peca, error: erroLeitura } = await supabase.from('pecas').select('imagens').eq('id', id).single()
  if (erroLeitura) return { ok: false, erro: 'Não encontramos essa peça.' }

  const doBucket = ((peca.imagens ?? []) as string[]).filter((c) => c && !c.startsWith('/') && !c.startsWith('http'))
  if (doBucket.length) {
    const { error } = await supabase.storage.from(BUCKET).remove(doBucket)
    // Falha ao apagar arquivo não impede apagar a peça: melhor um arquivo
    // esquecido no bucket do que uma peça que não sai do site.
    if (error) console.error('Falha ao apagar as fotos da peça:', error.message)
  }

  const { error } = await supabase.from('pecas').delete().eq('id', id)
  if (error) return { ok: false, erro: 'Não foi possível excluir a peça.' }
  revalidarSite('pecas')
  return { ok: true }
}
