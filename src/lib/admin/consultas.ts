import { CONFIGURACOES_PADRAO } from '../dados/padrao'
import type { LinhaColecao, LinhaPeca } from '../dados/linhas'
import { clienteServidor } from '../supabase/servidor'
import type { Configuracoes } from '../tipos'

/**
 * AS LEITURAS DO PAINEL.
 * ======================
 *
 * Diferente das do site: usam o cliente com sessão, não passam por cache, e
 * NÃO escondem as peças fora do ar. O Carlos precisa ver e editar justamente
 * as que tirou do site.
 */

export async function getPecasAdmin(): Promise<LinhaPeca[]> {
  const supabase = await clienteServidor()
  const { data, error } = await supabase.from('pecas').select('*').order('numero', { ascending: true })
  if (error) throw new Error(`Falha ao listar as peças: ${error.message}`)
  return data as LinhaPeca[]
}

export async function getPecaAdmin(id: string): Promise<LinhaPeca | null> {
  const supabase = await clienteServidor()
  const { data, error } = await supabase.from('pecas').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Falha ao carregar a peça: ${error.message}`)
  return (data as LinhaPeca | null) ?? null
}

/** O próximo número livre, sugerido na peça nova. É o que o Carlos escreve na ficha de papel. */
export function proximoNumero(pecas: Pick<LinhaPeca, 'numero'>[]): string {
  const maior = Math.max(0, ...pecas.map((p) => Number.parseInt(p.numero, 10)).filter(Number.isFinite))
  return String(maior + 1).padStart(4, '0')
}

export interface ColecaoComTotal extends LinhaColecao {
  /** Quantas peças estão nela. Zero libera a exclusão. */
  total: number
}

export async function getColecoesAdmin(): Promise<ColecaoComTotal[]> {
  const supabase = await clienteServidor()
  const [colecoes, pecas] = await Promise.all([
    supabase.from('colecoes').select('*').order('ordem', { ascending: true }),
    supabase.from('pecas').select('colecoes'),
  ])
  if (colecoes.error) throw new Error(`Falha ao listar as coleções: ${colecoes.error.message}`)

  const contagem = new Map<string, number>()
  for (const p of (pecas.data ?? []) as { colecoes: string[] | null }[]) {
    for (const slug of p.colecoes ?? []) contagem.set(slug, (contagem.get(slug) ?? 0) + 1)
  }
  return (colecoes.data as LinhaColecao[]).map((c) => ({ ...c, total: contagem.get(c.slug) ?? 0 }))
}

export interface Etiqueta {
  id: string
  texto: string
  ordem: number
  /** Quantas peças usam este selo hoje. */
  usos: number
}

/**
 * O catálogo de etiquetas, com o uso de cada uma. Nunca lança: sem a lista,
 * o campo de etiqueta continua aceitando texto livre.
 */
export async function getEtiquetas(): Promise<Etiqueta[]> {
  try {
    const supabase = await clienteServidor()
    const [catalogo, emUso] = await Promise.all([
      supabase.from('etiquetas').select('id, texto, ordem').order('ordem', { ascending: true }),
      supabase.from('pecas').select('etiqueta').not('etiqueta', 'is', null),
    ])
    if (catalogo.error) throw catalogo.error
    const contagem = new Map<string, number>()
    for (const l of (emUso.data ?? []) as { etiqueta: string | null }[]) {
      const t = l.etiqueta?.trim()
      if (t) contagem.set(t, (contagem.get(t) ?? 0) + 1)
    }
    return (catalogo.data as Omit<Etiqueta, 'usos'>[]).map((e) => ({ ...e, usos: contagem.get(e.texto) ?? 0 }))
  } catch (erro) {
    console.error('Falha ao ler as etiquetas:', erro)
    return []
  }
}

/** As Configurações como estão no banco, com o padrão por baixo do que estiver vazio. */
export async function getConfiguracoesAdmin(): Promise<Configuracoes> {
  const supabase = await clienteServidor()
  const { data } = await supabase.from('configuracoes').select('chave, valor')
  const porChave = new Map(((data ?? []) as { chave: string; valor: Record<string, string> }[]).map((l) => [l.chave, l.valor]))
  const contato = porChave.get('contato') ?? {}
  const mensagem = porChave.get('mensagem') ?? {}
  return {
    contato: { ...CONFIGURACOES_PADRAO.contato, ...contato },
    mensagemPeca: mensagem.peca || CONFIGURACOES_PADRAO.mensagemPeca,
  }
}

/* ------------------------------------------------------------ resultados */

export interface DiaDeCliques {
  /** "2026-09-24" */
  dia: string
  cliques: number
}

export interface PecaNoRanking {
  id: string
  nome: string
  numero: string
  slug: string
  visitas: number
  cliques: number
}

export interface Resumo {
  pecasNoAr: number
  visitas: number
  cliquesWhatsapp: number
  cliquesAprender: number
  porDia: DiaDeCliques[]
  ranking: PecaNoRanking[]
  vazio: boolean
}

export const DIAS_DO_RESUMO = 30

/**
 * Os números da tela de Resultados, dos últimos 30 dias, todos tirados de
 * `eventos`. Todo dia do período entra no gráfico, inclusive os sem clique:
 * pular os dias vazios faria a linha mentir.
 */
export async function getResumo(): Promise<Resumo> {
  const supabase = await clienteServidor()
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - (DIAS_DO_RESUMO - 1))
  inicio.setHours(0, 0, 0, 0)

  const [eventos, noAr] = await Promise.all([
    supabase
      .from('eventos')
      .select('tipo, created_at, peca_id, peca:pecas(nome, numero, slug)')
      .gte('created_at', inicio.toISOString()),
    supabase.from('pecas').select('id', { count: 'exact', head: true }).eq('ativo', true),
  ])
  if (eventos.error) throw new Error(`Falha ao ler os números: ${eventos.error.message}`)

  const linhas = eventos.data as unknown as {
    tipo: string
    created_at: string
    peca_id: string | null
    peca: { nome: string; numero: string; slug: string } | null
  }[]

  const porDia = new Map<string, number>()
  const cursor = new Date(inicio)
  for (let i = 0; i < DIAS_DO_RESUMO; i++) {
    porDia.set(cursor.toISOString().slice(0, 10), 0)
    cursor.setDate(cursor.getDate() + 1)
  }

  const porPeca = new Map<string, PecaNoRanking>()
  let visitas = 0
  let cliquesWhatsapp = 0
  let cliquesAprender = 0

  for (const l of linhas) {
    if (l.tipo === 'visita_peca') visitas++
    if (l.tipo === 'clique_aprender') cliquesAprender++
    if (l.tipo === 'clique_whatsapp') {
      cliquesWhatsapp++
      const dia = l.created_at.slice(0, 10)
      if (porDia.has(dia)) porDia.set(dia, (porDia.get(dia) ?? 0) + 1)
    }
    if (l.peca_id && l.peca) {
      const atual = porPeca.get(l.peca_id) ?? { id: l.peca_id, ...l.peca, visitas: 0, cliques: 0 }
      if (l.tipo === 'visita_peca') atual.visitas++
      if (l.tipo === 'clique_whatsapp') atual.cliques++
      porPeca.set(l.peca_id, atual)
    }
  }

  return {
    pecasNoAr: noAr.count ?? 0,
    visitas,
    cliquesWhatsapp,
    cliquesAprender,
    porDia: [...porDia.entries()].map(([dia, cliques]) => ({ dia, cliques })),
    ranking: [...porPeca.values()].sort((a, b) => b.visitas - a.visitas || b.cliques - a.cliques).slice(0, 10),
    vazio: linhas.length === 0,
  }
}
