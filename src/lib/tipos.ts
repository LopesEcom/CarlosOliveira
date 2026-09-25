/**
 * O ACERVO, COMO O SITE O ENXERGA.
 * ================================
 *
 * Um formato só para a peça, venha ela do Supabase (o painel do Carlos) ou do
 * `acervo.gerado.json` (a planilha, usada enquanto o Supabase não está
 * ligado). Os componentes nunca sabem de onde a peça veio: quem traduz é
 * lib/dados/.
 */

export type Tema = 'sacra' | 'fauna' | 'figura' | 'natureza' | 'utilitaria'

/**
 * `fora-de-venda` é peça que o Carlos mostra mas não vende (a bailarina
 * premiada, por exemplo). Continua no site: é acervo, é prova de ofício.
 */
export type Situacao = 'a-venda' | 'reservada' | 'vendida' | 'fora-de-venda'

export interface Peca {
  /** Chave interna (uuid no Supabase, o próprio slug nos dados locais). */
  id: string
  /** Quatro dígitos, o mesmo da ficha de papel e da etiqueta. */
  numero: string
  /** O endereço da página: `0002-coruja`. */
  slug: string
  nome: string
  tema: Tema
  descricao: string
  historia: string | null
  madeira: string | null
  altura: number | null
  largura: number | null
  profundidade: number | null
  peso: number | null
  ano: number | null
  acabamento: string | null
  /** Em reais. `null` é "sob consulta". */
  preco: number | null
  /** Valor cheio, mostrado riscado ao lado do preço. Só em promoção. */
  precoOriginal: number | null
  /** Mostra "a partir de" antes do valor (peça que varia com a madeira, por exemplo). */
  aPartirDe: boolean
  situacao: Situacao
  aceitaEncomenda: boolean
  destaque: boolean
  /** Desligado, a peça fica só no painel. */
  ativo: boolean
  /** O selo no canto da foto ("Novidade", "Última"). Texto livre do painel. */
  etiqueta: string | null
  /** Slugs das coleções. */
  colecoes: string[]
  /** URLs prontas para o `<img>`, na ordem. A primeira é a capa. */
  imagens: string[]
  ordem: number
  criadoEm: string
}

export interface Colecao {
  id: string
  slug: string
  nome: string
  descricao: string
  /** URL pronta, ou `null` para usar a capa da primeira peça da coleção. */
  imagemCapa: string | null
  ordem: number
}

/** O que o Carlos edita em Configurações, no painel. */
export interface Contato {
  /** Só dígitos, com DDI: é o que o wa.me aceita. */
  whatsapp: string
  /** Como o número aparece escrito. Vazio esconde. */
  whatsappExibicao: string
  /** Com arroba. Vazio esconde. */
  instagram: string
  email: string
  cidade: string
}

export interface Configuracoes {
  contato: Contato
  /**
   * O começo da mensagem de compra de uma peça. `{peca}` vira "Nº 0002 ·
   * Coruja" e `{link}` o endereço da página.
   */
  mensagemPeca: string
}

export const rotulosTema: Record<Tema, string> = {
  sacra: 'Arte sacra',
  fauna: 'Fauna',
  figura: 'Figura humana',
  natureza: 'Natureza',
  utilitaria: 'Utilitárias',
}

export const TEMAS = Object.keys(rotulosTema) as Tema[]

export const rotulosSituacao: Record<Situacao, string> = {
  'a-venda': 'À venda',
  reservada: 'Reservada',
  vendida: 'Vendida',
  'fora-de-venda': 'Acervo pessoal',
}

export const SITUACOES = Object.keys(rotulosSituacao) as Situacao[]

/** Dá para pedir: está à venda e não reservada. */
export function podeComprar(peca: Pick<Peca, 'situacao'>): boolean {
  return peca.situacao === 'a-venda'
}
