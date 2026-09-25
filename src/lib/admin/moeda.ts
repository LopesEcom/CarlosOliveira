/**
 * Dinheiro no formulário do painel.
 *
 * O campo guarda centavos e mostra formatado: quem digita "380" vê
 * "R$ 3,80", "38000" vê "R$ 380,00". É o comportamento de máscara que quem
 * digita valor em aplicativo de banco já espera, e evita a dúvida entre
 * vírgula e ponto.
 */
export function centavosParaTexto(centavos: number | null): string {
  if (centavos === null) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100)
}

export function textoParaCentavos(texto: string): number | null {
  const digitos = texto.replace(/\D/g, '')
  return digitos ? Number.parseInt(digitos, 10) : null
}

export const centavosParaReais = (c: number | null) => (c === null ? null : c / 100)
export const reaisParaCentavos = (r: number | null) => (r === null ? null : Math.round(r * 100))
