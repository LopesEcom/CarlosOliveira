import { normalizar } from '../formato'
import { podeComprar, rotulosTema, TEMAS, type Colecao, type Peca, type Tema } from '../tipos'

/**
 * OS FILTROS DO ACERVO, SEM TELA.
 * ===============================
 *
 * Mesma estrutura do acervo da Lennys: o estado inteiro vive na URL
 * (`/acervo?colecao=parede&tema=sacra&preco=500-2000&ordem=menor-preco`). É
 * o que torna o link colável no WhatsApp ("olha as imagens sacras de
 * parede") e faz o voltar do navegador desfazer o último filtro.
 *
 * Aqui mora só a tradução URL ↔ estado e a filtragem. A tela (os
 * componentes em components/acervo/) lê e escreve por estas funções.
 */

/** Quantas peças o "Carregar mais" acrescenta por vez. */
export const PASSO_PAGINA = 12

export const ORDENACOES = [
  { valor: 'destaques', rotulo: 'Destaques primeiro' },
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
  { valor: 'nome', rotulo: 'Nome, de A a Z' },
  { valor: 'numero', rotulo: 'Número da peça' },
] as const

export type OrdemAcervo = (typeof ORDENACOES)[number]['valor']

export interface EstadoAcervo {
  colecoes: string[]
  temas: Tema[]
  madeiras: string[]
  precoMin?: number
  precoMax?: number
  soAVenda: boolean
  busca?: string
  ordem: OrdemAcervo
  mostrar: number
}

export type ParametrosBusca = Record<string, string | string[] | undefined>

function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor
}

function lista(valor: string | string[] | undefined): string[] {
  const bruto = primeiro(valor)
  return bruto
    ? bruto
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : []
}

function inteiro(valor: string | undefined): number | undefined {
  if (!valor) return undefined
  const n = Number.parseInt(valor, 10)
  return Number.isFinite(n) ? n : undefined
}

/** Lê a URL. Valor estranho (link colado torto) é ignorado, nunca quebra a página. */
export function lerEstado(params: ParametrosBusca): EstadoAcervo {
  const [min, max] = (primeiro(params.preco) ?? '').split('-')
  const ordemBruta = primeiro(params.ordem)
  const ordem = ORDENACOES.some((o) => o.valor === ordemBruta) ? (ordemBruta as OrdemAcervo) : 'destaques'

  return {
    colecoes: lista(params.colecao),
    temas: lista(params.tema).filter((t): t is Tema => (TEMAS as string[]).includes(t)),
    madeiras: lista(params.madeira),
    precoMin: inteiro(min),
    precoMax: inteiro(max),
    soAVenda: primeiro(params.venda) === '1',
    busca: primeiro(params.q)?.trim() || undefined,
    ordem,
    mostrar: Math.max(PASSO_PAGINA, inteiro(primeiro(params.mostrar)) ?? PASSO_PAGINA),
  }
}

/** Escreve o estado de volta. Só grava o que difere do padrão, para o link ficar curto. */
export function escreverEstado(estado: EstadoAcervo): string {
  const p = new URLSearchParams()
  if (estado.colecoes.length) p.set('colecao', estado.colecoes.join(','))
  if (estado.temas.length) p.set('tema', estado.temas.join(','))
  if (estado.madeiras.length) p.set('madeira', estado.madeiras.join(','))
  if (estado.precoMin !== undefined || estado.precoMax !== undefined) {
    p.set('preco', `${estado.precoMin ?? ''}-${estado.precoMax ?? ''}`)
  }
  if (estado.soAVenda) p.set('venda', '1')
  if (estado.busca) p.set('q', estado.busca)
  if (estado.ordem !== 'destaques') p.set('ordem', estado.ordem)
  if (estado.mostrar !== PASSO_PAGINA) p.set('mostrar', String(estado.mostrar))
  const query = p.toString()
  return query ? `/acervo?${query}` : '/acervo'
}

/** Liga ou desliga um valor de um filtro de múltipla escolha. */
export function alternar<T extends string>(atual: T[], valor: T): T[] {
  return atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor]
}

/** Algum filtro ligado? Controla o "Limpar filtros". */
export function temFiltro(e: EstadoAcervo): boolean {
  return Boolean(
    e.colecoes.length ||
      e.temas.length ||
      e.madeiras.length ||
      e.precoMin !== undefined ||
      e.precoMax !== undefined ||
      e.soAVenda ||
      e.busca,
  )
}

/** Quantos filtros estão ligados: vira o contador do botão "Filtrar" no celular. */
export function contarFiltros(e: EstadoAcervo): number {
  return (
    e.colecoes.length +
    e.temas.length +
    e.madeiras.length +
    (e.precoMin !== undefined || e.precoMax !== undefined ? 1 : 0) +
    (e.soAVenda ? 1 : 0) +
    (e.busca ? 1 : 0)
  )
}

/**
 * Uma coleção escolhida e nenhum outro filtro: a página ganha a capa dela.
 * Com mais filtros o recorte deixa de ser "a coleção", e a capa mentiria.
 */
export function colecaoSozinha(e: EstadoAcervo): string | null {
  const outros = { ...e, colecoes: [] }
  return e.colecoes.length === 1 && !temFiltro(outros) ? e.colecoes[0] : null
}

/* ----------------------------------------------------------- filtragem */

/** O texto em que a busca procura: número, nome, descrição, madeira e tema. */
function textoDeBusca(p: Peca): string {
  return normalizar([p.numero, p.nome, p.descricao, p.madeira, rotulosTema[p.tema]].filter(Boolean).join(' '))
}

const nomes = new Intl.Collator('pt-BR')

export function filtrar(pecas: Peca[], e: EstadoAcervo): Peca[] {
  const termo = e.busca ? normalizar(e.busca) : ''
  const filtradas = pecas.filter(
    (p) =>
      (!e.colecoes.length || p.colecoes.some((c) => e.colecoes.includes(c))) &&
      (!e.temas.length || e.temas.includes(p.tema)) &&
      (!e.madeiras.length || (p.madeira !== null && e.madeiras.includes(p.madeira))) &&
      (e.precoMin === undefined || (p.preco !== null && p.preco >= e.precoMin)) &&
      (e.precoMax === undefined || (p.preco !== null && p.preco <= e.precoMax)) &&
      (!e.soAVenda || podeComprar(p)) &&
      (!termo || textoDeBusca(p).includes(termo)),
  )
  return ordenar(filtradas, e.ordem)
}

function ordenar(pecas: Peca[], ordem: OrdemAcervo): Peca[] {
  const copia = [...pecas]
  /* Peça sob consulta vai para o fim nas duas ordens de preço: não é a mais
     barata nem a mais cara, só não tem preço publicado. */
  const preco = (p: Peca, semValor: number) => p.preco ?? semValor
  switch (ordem) {
    case 'menor-preco':
      return copia.sort((a, b) => preco(a, Infinity) - preco(b, Infinity))
    case 'maior-preco':
      return copia.sort((a, b) => preco(b, -Infinity) - preco(a, -Infinity))
    case 'recentes':
      return copia.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm) || b.numero.localeCompare(a.numero))
    case 'nome':
      return copia.sort((a, b) => nomes.compare(a.nome, b.nome))
    case 'numero':
      return copia.sort((a, b) => a.numero.localeCompare(b.numero))
    default:
      return copia.sort((a, b) => Number(b.destaque) - Number(a.destaque) || a.ordem - b.ordem)
  }
}

/* ------------------------------------------------------------- facetas */

export interface OpcaoFaceta {
  valor: string
  rotulo: string
  /** Quantas peças publicadas têm este valor. */
  total: number
}

export interface Facetas {
  colecoes: OpcaoFaceta[]
  temas: OpcaoFaceta[]
  madeiras: OpcaoFaceta[]
  precoMin: number
  precoMax: number
  /** Há peça vendida, reservada ou fora de venda? Senão o "Só à venda" não aparece. */
  temIndisponivel: boolean
  total: number
}

/**
 * As opções dos filtros, tiradas do acervo real, com contagem.
 *
 * Madeira que ninguém tem não aparece como filtro, e a faixa de preço nasce
 * na faixa que existe de fato. Enquanto todas as peças são "sob consulta",
 * o filtro de preço simplesmente não aparece.
 */
export function montarFacetas(pecas: Peca[], colecoes: Colecao[]): Facetas {
  const contar = (valores: string[]) => {
    const mapa = new Map<string, number>()
    for (const v of valores) mapa.set(v, (mapa.get(v) ?? 0) + 1)
    return mapa
  }

  const porColecao = contar(pecas.flatMap((p) => p.colecoes))
  const porTema = contar(pecas.map((p) => p.tema))
  const porMadeira = contar(pecas.map((p) => p.madeira).filter((m): m is string => Boolean(m)))
  const precos = pecas.map((p) => p.preco).filter((v): v is number => v !== null && v > 0)

  return {
    colecoes: colecoes
      .filter((c) => porColecao.has(c.slug))
      .map((c) => ({ valor: c.slug, rotulo: c.nome, total: porColecao.get(c.slug) ?? 0 })),
    temas: TEMAS.filter((t) => porTema.has(t)).map((t) => ({ valor: t, rotulo: rotulosTema[t], total: porTema.get(t) ?? 0 })),
    madeiras: [...porMadeira.entries()]
      .map(([valor, total]) => ({ valor, rotulo: valor, total }))
      .sort((a, b) => nomes.compare(a.rotulo, b.rotulo)),
    precoMin: precos.length ? Math.floor(Math.min(...precos)) : 0,
    precoMax: precos.length ? Math.ceil(Math.max(...precos)) : 0,
    temIndisponivel: pecas.some((p) => !podeComprar(p)),
    total: pecas.length,
  }
}

/* -------------------------------------------------------- relacionadas */

/**
 * As peças mais parecidas: mesmo tema vale mais que mesma coleção, e no
 * empate ganha a de número mais perto (peças vizinhas na planilha costumam
 * ser da mesma leva).
 */
export function relacionadas(peca: Peca, todas: Peca[], limite = 4): Peca[] {
  const pontos = (outra: Peca) =>
    (outra.tema === peca.tema ? 2 : 0) + outra.colecoes.filter((c) => peca.colecoes.includes(c)).length
  const distancia = (outra: Peca) => Math.abs(Number(outra.numero) - Number(peca.numero))
  return todas
    .filter((outra) => outra.id !== peca.id)
    .sort((a, b) => pontos(b) - pontos(a) || distancia(a) - distancia(b))
    .slice(0, limite)
}

/* --------------------------------------------------------------- capas */

/**
 * A capa de uma coleção: a foto que o Carlos escolheu no painel ou, enquanto
 * ele não escolhe, a primeira peça da coleção. Coleção sem nenhuma peça
 * publicada não tem capa, e não aparece.
 */
export function capaDaColecao(colecao: Colecao, pecas: Peca[]): string | null {
  return colecao.imagemCapa ?? pecas.find((p) => p.colecoes.includes(colecao.slug) && p.imagens[0])?.imagens[0] ?? null
}
