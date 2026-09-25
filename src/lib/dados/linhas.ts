import { urlDaImagem } from '../supabase/env'
import type { Colecao, Peca, Situacao, Tema } from '../tipos'

/**
 * As linhas como o Supabase devolve (nomes de coluna em snake_case, ver
 * supabase/migrations/001_esquema.sql) e a tradução para o formato do site.
 */

export interface LinhaPeca {
  id: string
  numero: string
  slug: string
  nome: string
  tema: Tema
  descricao: string | null
  historia: string | null
  madeira: string | null
  altura: number | string | null
  largura: number | string | null
  profundidade: number | string | null
  peso: number | string | null
  ano: number | null
  acabamento: string | null
  preco: number | string | null
  preco_original: number | string | null
  a_partir_de: boolean
  situacao: Situacao
  aceita_encomenda: boolean
  destaque: boolean
  ativo: boolean
  etiqueta: string | null
  colecoes: string[] | null
  imagens: string[] | null
  ordem: number
  created_at: string
}

export interface LinhaColecao {
  id: string
  slug: string
  nome: string
  descricao: string | null
  imagem_capa: string | null
  ordem: number
}

/** `numeric` do Postgres pode chegar como texto; o site só quer número ou nada. */
function num(valor: number | string | null): number | null {
  if (valor === null || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

export function pecaDaLinha(linha: LinhaPeca): Peca {
  return {
    id: linha.id,
    numero: linha.numero,
    slug: linha.slug,
    nome: linha.nome,
    tema: linha.tema,
    descricao: linha.descricao ?? '',
    historia: linha.historia,
    madeira: linha.madeira,
    altura: num(linha.altura),
    largura: num(linha.largura),
    profundidade: num(linha.profundidade),
    peso: num(linha.peso),
    ano: linha.ano,
    acabamento: linha.acabamento,
    preco: num(linha.preco),
    precoOriginal: num(linha.preco_original),
    aPartirDe: linha.a_partir_de,
    situacao: linha.situacao,
    aceitaEncomenda: linha.aceita_encomenda,
    destaque: linha.destaque,
    ativo: linha.ativo,
    etiqueta: linha.etiqueta,
    colecoes: linha.colecoes ?? [],
    imagens: (linha.imagens ?? []).map(urlDaImagem),
    ordem: linha.ordem,
    criadoEm: linha.created_at,
  }
}

export function colecaoDaLinha(linha: LinhaColecao): Colecao {
  return {
    id: linha.id,
    slug: linha.slug,
    nome: linha.nome,
    descricao: linha.descricao ?? '',
    imagemCapa: linha.imagem_capa ? urlDaImagem(linha.imagem_capa) : null,
    ordem: linha.ordem,
  }
}
