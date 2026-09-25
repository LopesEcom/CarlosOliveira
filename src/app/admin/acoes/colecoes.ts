'use server'

import { revalidatePath } from 'next/cache'

import { revalidarSite, type ResultadoAcao } from '../../../lib/admin/revalidar'
import { gerarSlug } from '../../../lib/formato'
import { clienteServidor } from '../../../lib/supabase/servidor'

/**
 * AS COLEÇÕES PELO PAINEL.
 * ========================
 *
 * O endereço da coleção (`parede`, `devocao`) nasce do nome no cadastro e não
 * muda mais: as peças guardam a coleção por ele, e trocar o endereço
 * soltaria todas as peças dela sem ninguém entender por quê. Renomear a
 * coleção muda só o nome que aparece.
 */

export interface DadosColecao {
  nome: string
  descricao: string
  /** Caminho da foto no bucket. Vazio usa a primeira peça da coleção. */
  imagemCapa: string
}

function revalidar() {
  revalidarSite('colecoes')
  revalidatePath('/admin/colecoes')
}

export async function salvarColecao(id: string | null, dados: DadosColecao): Promise<ResultadoAcao> {
  const nome = dados.nome.trim()
  if (nome.length < 2) return { ok: false, erro: 'Escreva o nome da coleção.' }

  const supabase = await clienteServidor()
  const campos = { nome, descricao: dados.descricao.trim() || null, imagem_capa: dados.imagemCapa.trim() || null }

  if (id) {
    const { error } = await supabase.from('colecoes').update(campos).eq('id', id)
    if (error) return { ok: false, erro: 'Não foi possível salvar a coleção.' }
  } else {
    const slug = gerarSlug(nome)
    if (!slug) return { ok: false, erro: 'Escreva um nome com letras.' }
    const { data: ultima } = await supabase.from('colecoes').select('ordem').order('ordem', { ascending: false }).limit(1).maybeSingle()
    const { error } = await supabase.from('colecoes').insert({ ...campos, slug, ordem: ((ultima?.ordem as number | undefined) ?? 0) + 1 })
    if (error) {
      return {
        ok: false,
        erro: error.message.includes('duplicate') ? 'Já existe uma coleção com esse nome.' : 'Não foi possível criar a coleção.',
      }
    }
  }

  revalidar()
  return { ok: true }
}

/**
 * Coleção com peças não pode ser apagada: as peças perderiam a coleção e
 * sumiriam do filtro sem aviso. A mensagem diz quantas são e o que fazer.
 */
export async function excluirColecao(id: string): Promise<ResultadoAcao> {
  const supabase = await clienteServidor()
  const { data: colecao } = await supabase.from('colecoes').select('slug').eq('id', id).maybeSingle()
  if (!colecao) return { ok: false, erro: 'Não encontramos essa coleção.' }

  const { count } = await supabase
    .from('pecas')
    .select('id', { count: 'exact', head: true })
    .contains('colecoes', [colecao.slug as string])
  if (count) {
    return {
      ok: false,
      erro: `Esta coleção tem ${count === 1 ? '1 peça' : `${count} peças`}. Tire as peças dela antes de apagar.`,
    }
  }

  const { error } = await supabase.from('colecoes').delete().eq('id', id)
  if (error) return { ok: false, erro: 'Não foi possível apagar a coleção.' }
  revalidar()
  return { ok: true }
}

/** Troca a posição de duas coleções: é a ordem do site e dos filtros. */
export async function trocarOrdem(a: { id: string; ordem: number }, b: { id: string; ordem: number }): Promise<ResultadoAcao> {
  const supabase = await clienteServidor()
  const [r1, r2] = await Promise.all([
    supabase.from('colecoes').update({ ordem: b.ordem }).eq('id', a.id),
    supabase.from('colecoes').update({ ordem: a.ordem }).eq('id', b.id),
  ])
  if (r1.error || r2.error) return { ok: false, erro: 'Não foi possível mudar a ordem.' }
  revalidar()
  return { ok: true }
}
