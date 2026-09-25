import dados from '../../data/acervo.gerado.json'
import type { Colecao, Peca, Situacao, Tema } from '../tipos'

/**
 * O ACERVO DA PLANILHA, ENQUANTO O SUPABASE NÃO EXISTE.
 * ====================================================
 *
 * `acervo.gerado.json` sai do `npm run acervo` (acervo/acervo.xlsx). Aqui ele
 * vira o mesmo formato que o Supabase devolve, para o site funcionar igual
 * com ou sem banco. O mesmo arquivo é a origem do `npm run seed`, que monta a
 * carga inicial do Supabase: as 31 peças já cadastradas entram no painel sem
 * ninguém digitar de novo.
 */

interface PecaJson {
  id: string
  numero: string
  slug: string
  nome: string
  categoria: Tema
  descricao: string
  madeira?: string
  medidas?: { altura?: number; largura?: number; profundidade?: number }
  peso?: number
  ano?: number
  acabamento?: string
  preco: { modo: 'consulta' | 'valor' | 'a-partir-de'; valor: number | null }
  situacao: Situacao
  aceitaEncomenda: boolean
  destaque: boolean
  colecoes: string[]
  historia?: string
  fotos: { src: string }[]
}

function pecaDoJson(p: PecaJson, indice: number): Peca {
  return {
    // Sem banco não há uuid: o slug é único e serve de chave.
    id: p.id,
    numero: p.numero,
    slug: p.id,
    nome: p.nome,
    tema: p.categoria,
    descricao: p.descricao,
    historia: p.historia ?? null,
    madeira: p.madeira ?? null,
    altura: p.medidas?.altura ?? null,
    largura: p.medidas?.largura ?? null,
    profundidade: p.medidas?.profundidade ?? null,
    peso: p.peso ?? null,
    ano: p.ano ?? null,
    acabamento: p.acabamento ?? null,
    preco: p.preco.modo === 'consulta' ? null : p.preco.valor,
    precoOriginal: null,
    aPartirDe: p.preco.modo === 'a-partir-de',
    situacao: p.situacao,
    aceitaEncomenda: p.aceitaEncomenda,
    destaque: p.destaque,
    ativo: true,
    etiqueta: null,
    colecoes: p.colecoes,
    imagens: p.fotos.map((f) => f.src),
    ordem: indice,
    criadoEm: dados.geradoEm,
  }
}

export const pecasLocais: Peca[] = (dados.pecas as PecaJson[]).map(pecaDoJson)

export const colecoesLocais: Colecao[] = dados.colecoes.map((c, indice) => ({
  id: c.id,
  slug: c.id,
  nome: c.nome,
  descricao: c.descricao,
  imagemCapa: null,
  ordem: indice,
}))
