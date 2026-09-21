/**
 * Constantes da marca — fonte única de verdade.
 * Tudo que é "identidade" ou "contato" mora aqui; nenhum componente
 * deve hardcodar número, @ ou nome do escultor.
 */
export const brand = {
  /**
   * Nome corrente. Use em texto que o visitante lê como conversa —
   * mensagens de WhatsApp, descrições, meta tags.
   */
  nome: 'Carlos Oliveira',

  subtitulo: 'Escultor entalhador',

  /**
   * Autobiografia do Carlos. O título completo é longo demais para caber num
   * botão, então fica separado do nome curto que aparece na navegação.
   */
  livro: {
    titulo: 'Artepira',
    subtitulo: 'por que foi uma terapia para mim',
    get completo() {
      return `${this.titulo}, ${this.subtitulo}`
    },
  },

  /**
   * ⚠️ PLACEHOLDER — trocar pelo número real antes de publicar.
   * Formato internacional, apenas dígitos: 55 + DDD + número.
   * O valor abaixo é propositalmente inválido (nenhum DDD começa em 00),
   * para ninguém publicar sem perceber que ainda não foi preenchido.
   */
  whatsapp: '5500000000000',
  /** Mesmo número, formatado para leitura. Vazio enquanto for placeholder. */
  whatsappExibicao: '',

  /**
   * Vazio esconde o link em todo o site (cabeçalho, rodapé e a seção da home).
   * Preencha com o @ quando houver perfil — ex.: '@carlosoliveira.entalhes'.
   */
  instagram: '',

  /** Vazio esconde a linha de cidade no rodapé. */
  cidade: '',
  email: '',
} as const

/** Título usado como sufixo em todas as páginas. */
export const TITULO_BASE = 'Carlos Oliveira | Escultor entalhador'

/**
 * TODO: trocar pelo domínio real após o deploy.
 * Usado nas URLs canônicas e nas imagens de Open Graph, que precisam ser
 * absolutas — robô de preview não resolve caminho relativo.
 * Sem barra no final.
 */
export const SITE_URL = 'https://carlos-oliveira-entalhes.vercel.app'

/**
 * URL do perfil no Instagram, ou null enquanto não houver @ cadastrado.
 *
 * A cópia em `const` existe por causa do `as const` acima: sem ela o
 * TypeScript estreita `brand.instagram` para o literal `''` e conclui que o
 * ramo verdadeiro do ternário é inalcançável. Anotar como `string` devolve o
 * tipo largo e faz o dia em que o @ for preenchido continuar compilando.
 */
const instagram: string = brand.instagram

export const linkInstagram: string | null = instagram
  ? `https://instagram.com/${instagram.replace(/^@/, '')}`
  : null

/**
 * Monta o link de conversa no WhatsApp com mensagem pré-preenchida.
 *
 * @example
 * linkWhatsApp('Olá! Tenho interesse na peça Coruja.')
 * // → https://wa.me/5500000000000?text=Ol%C3%A1!%20Tenho%20interesse...
 */
export function linkWhatsApp(mensagem: string): string {
  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(mensagem)}`
}
