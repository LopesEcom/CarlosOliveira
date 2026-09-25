import type { Peca } from './tipos'

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const reaisComCentavos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

/**
 * "R$ 1.200", ou "R$ 1.200,50" quando há centavos. Escultura não costuma ter
 * centavo, e "R$ 1.200,00" só alonga a linha do preço.
 */
export function precoBRL(valor: number): string {
  return Number.isInteger(valor) ? reais.format(valor) : reaisComCentavos.format(valor)
}

/** "R$ 1.200", "A partir de R$ 1.200", ou `null` quando é sob consulta. */
export function textoPreco(peca: Pick<Peca, 'preco' | 'aPartirDe'>): string | null {
  if (peca.preco === null) return null
  return peca.aPartirDe ? `A partir de ${precoBRL(peca.preco)}` : precoBRL(peca.preco)
}

/** "32 × 12 × 10 cm", só com as medidas que existem, na ordem altura, largura, fundura. */
export function textoMedidas(peca: Pick<Peca, 'altura' | 'largura' | 'profundidade'>): string | null {
  const partes = [peca.altura, peca.largura, peca.profundidade].filter((v): v is number => v !== null)
  return partes.length ? `${partes.map((v) => numero.format(v)).join(' × ')} cm` : null
}

/** Madeira e medidas numa linha: "Cedro · 32 × 12 × 10 cm". */
export function fichaCurta(peca: Peca): string | null {
  const partes = [peca.madeira, textoMedidas(peca)].filter(Boolean)
  return partes.length ? partes.join(' · ') : null
}

export function kg(valor: number): string {
  return `${numero.format(valor)} kg`
}

/** "Coração", "CORACAO" e "coracao" são a mesma busca. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/** Nome em formato de endereço: "Santa Ceia" → "santa-ceia". */
export function gerarSlug(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
