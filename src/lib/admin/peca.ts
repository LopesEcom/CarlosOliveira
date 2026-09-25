import type { LinhaPeca } from '../dados/linhas'
import { gerarSlug } from '../formato'
import { SITUACOES, TEMAS, type Situacao, type Tema } from '../tipos'
import { centavosParaReais, reaisParaCentavos } from './moeda'

/**
 * A PEÇA NO FORMULÁRIO DO PAINEL.
 * ===============================
 *
 * O que o formulário edita e o que a ação de salvar recebe. Dinheiro em
 * centavos (a máscara de moeda não perde precisão), medidas como texto (o
 * Carlos escreve "32,5"), fotos como caminhos do Storage.
 *
 * As mensagens de erro dizem o que fazer, não o que está errado: quem lê é o
 * Carlos, não uma pessoa técnica.
 */
export interface DadosPeca {
  numero: string
  nome: string
  tema: Tema
  descricao: string
  historia: string
  madeira: string
  altura: string
  largura: string
  profundidade: string
  peso: string
  ano: string
  acabamento: string
  precoCentavos: number | null
  precoOriginalCentavos: number | null
  aPartirDe: boolean
  situacao: Situacao
  aceitaEncomenda: boolean
  etiqueta: string
  colecoes: string[]
  /** Caminhos no bucket (ou em public/, para as fotos antigas). A primeira é a capa. */
  imagens: string[]
  ativo: boolean
  destaque: boolean
}

export const LIMITE_ETIQUETA = 18

export function pecaVazia(proximoNumero: string): DadosPeca {
  return {
    numero: proximoNumero,
    nome: '',
    tema: 'sacra',
    descricao: '',
    historia: '',
    madeira: '',
    altura: '',
    largura: '',
    profundidade: '',
    peso: '',
    ano: '',
    acabamento: '',
    precoCentavos: null,
    precoOriginalCentavos: null,
    aPartirDe: false,
    situacao: 'a-venda',
    aceitaEncomenda: true,
    etiqueta: '',
    colecoes: [],
    imagens: [],
    ativo: true,
    destaque: false,
  }
}

const textoDe = (valor: number | string | null) => (valor === null ? '' : String(valor).replace('.', ','))

export function dadosDaLinha(linha: LinhaPeca): DadosPeca {
  const reais = (v: number | string | null) => (v === null ? null : Number(v))
  return {
    numero: linha.numero,
    nome: linha.nome,
    tema: linha.tema,
    descricao: linha.descricao ?? '',
    historia: linha.historia ?? '',
    madeira: linha.madeira ?? '',
    altura: textoDe(linha.altura),
    largura: textoDe(linha.largura),
    profundidade: textoDe(linha.profundidade),
    peso: textoDe(linha.peso),
    ano: linha.ano === null ? '' : String(linha.ano),
    acabamento: linha.acabamento ?? '',
    precoCentavos: reaisParaCentavos(reais(linha.preco)),
    precoOriginalCentavos: reaisParaCentavos(reais(linha.preco_original)),
    aPartirDe: linha.a_partir_de,
    situacao: linha.situacao,
    aceitaEncomenda: linha.aceita_encomenda,
    etiqueta: linha.etiqueta ?? '',
    colecoes: linha.colecoes ?? [],
    imagens: linha.imagens ?? [],
    ativo: linha.ativo,
    destaque: linha.destaque,
  }
}

/** "32,5" → 32.5; vazio → null; texto que não é número → NaN (vira erro). */
function numero(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, '')
  if (!limpo) return null
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  const n = Number(normal)
  return Number.isFinite(n) && n >= 0 ? n : Number.NaN
}

export type ResultadoValidacao =
  | { ok: true; linha: Omit<LinhaPeca, 'id' | 'created_at' | 'ordem'> }
  | { ok: false; erro: string }

/**
 * Confere o formulário e devolve a linha pronta para o banco.
 *
 * O endereço da página (`slug`) não é campo: sai do número e do nome, sempre.
 * Se o nome mudar, o endereço muda junto, e o link antigo continua abrindo a
 * peça certa, porque a página redireciona pelo número.
 */
export function validarPeca(d: DadosPeca): ResultadoValidacao {
  const nome = d.nome.trim()
  if (nome.length < 2) return { ok: false, erro: 'Escreva o nome da peça.' }

  const digitos = d.numero.replace(/\D/g, '')
  if (!digitos || digitos.length > 4) {
    return { ok: false, erro: 'O número precisa ter até quatro algarismos, o mesmo da ficha de papel. Ex.: 0033.' }
  }
  const num = digitos.padStart(4, '0')

  if (!TEMAS.includes(d.tema)) return { ok: false, erro: 'Escolha o tema da peça.' }
  if (!SITUACOES.includes(d.situacao)) return { ok: false, erro: 'Escolha a situação da peça.' }

  const medidas = {
    altura: numero(d.altura),
    largura: numero(d.largura),
    profundidade: numero(d.profundidade),
    peso: numero(d.peso),
  }
  for (const [campo, valor] of Object.entries(medidas)) {
    if (Number.isNaN(valor)) return { ok: false, erro: `Confira o campo ${campo}: escreva só o número, como 32 ou 32,5.` }
  }

  const ano = d.ano.trim() ? Number.parseInt(d.ano, 10) : null
  if (ano !== null && (!Number.isFinite(ano) || ano < 1900 || ano > 2100)) {
    return { ok: false, erro: 'Confira o ano: quatro algarismos, como 2019.' }
  }

  if (d.precoOriginalCentavos !== null && d.precoCentavos === null) {
    return { ok: false, erro: 'Para mostrar o preço antigo riscado, preencha também o preço atual.' }
  }
  if (d.precoOriginalCentavos !== null && d.precoCentavos !== null && d.precoOriginalCentavos <= d.precoCentavos) {
    return { ok: false, erro: 'O preço antigo precisa ser maior que o preço atual, senão não é promoção.' }
  }

  const etiqueta = d.etiqueta.trim()
  if (etiqueta.length > LIMITE_ETIQUETA) {
    return { ok: false, erro: `A etiqueta precisa caber no canto da foto: até ${LIMITE_ETIQUETA} letras.` }
  }

  const vazioViraNulo = (t: string) => t.trim() || null

  return {
    ok: true,
    linha: {
      numero: num,
      slug: `${num}-${gerarSlug(nome)}`,
      nome,
      tema: d.tema,
      descricao: vazioViraNulo(d.descricao),
      historia: vazioViraNulo(d.historia),
      madeira: vazioViraNulo(d.madeira),
      altura: medidas.altura,
      largura: medidas.largura,
      profundidade: medidas.profundidade,
      peso: medidas.peso,
      ano,
      acabamento: vazioViraNulo(d.acabamento),
      preco: centavosParaReais(d.precoCentavos),
      preco_original: centavosParaReais(d.precoOriginalCentavos),
      a_partir_de: d.precoCentavos !== null && d.aPartirDe,
      situacao: d.situacao,
      aceita_encomenda: d.aceitaEncomenda,
      destaque: d.destaque,
      ativo: d.ativo,
      etiqueta: etiqueta || null,
      colecoes: [...new Set(d.colecoes)],
      imagens: d.imagens.filter(Boolean),
    },
  }
}
