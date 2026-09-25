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
    titulo: 'Arterapia',
    subtitulo: 'Minha história, minha arte, minha missão',
    get completo() {
      return `${this.titulo}: ${this.subtitulo}`
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
 * O DOMÍNIO, NUM LUGAR SÓ. Sem barra no final.
 *
 * TODO (Etapa 8): trocar pelo domínio real. As URLs canônicas, as imagens de
 * preview, o sitemap e os links das peças nas mensagens saem daqui.
 * `npm run conferir` avisa enquanto ele for o endereço provisório da Vercel.
 */
export const SITE_URL = 'https://carlos-oliveira-entalhes.vercel.app'

/**
 * O código de verificação do Google Search Console (Etapa 8), só o valor do
 * `content` da meta tag que o Search Console mostra no método "Tag HTML".
 * Vazio não gera tag nenhuma. Verificar pelo DNS do domínio também serve,
 * e aí isto fica vazio para sempre.
 */
export const VERIFICACAO_GOOGLE = ''

/** URL do perfil a partir do @ salvo no painel, ou `null` enquanto não houver perfil. */
export function linkDoInstagram(arroba: string): string | null {
  const perfil = arroba.trim().replace(/^@/, '')
  return perfil ? `https://instagram.com/${perfil}` : null
}

/**
 * Monta o link de conversa no WhatsApp com a mensagem já escrita.
 *
 * O número vem das Configurações do painel (ver lib/dados/consultas.ts); o de
 * `brand.whatsapp` é só o padrão enquanto o Carlos não preenche.
 *
 * @example
 * linkWhatsApp('5522999999999', 'Olá! Tenho interesse na peça Coruja.')
 */
export function linkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`
}
