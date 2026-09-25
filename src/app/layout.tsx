import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import type { ReactNode } from 'react'

import { SITE_URL, TITULO_BASE, VERIFICACAO_GOOGLE, brand } from '../lib/brand'
import './globals.css'

/**
 * As duas famílias, servidas do próprio site pelo `next/font`: sem ida ao
 * Google na hora de abrir a página, e sem o texto piscar trocando de fonte.
 * As variáveis são lidas em globals.css (`--font-display`, `--font-corpo`).
 */
const serifa = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--fonte-serifa',
  display: 'swap',
})

const texto = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--fonte-texto',
  display: 'swap',
})

const DESCRICAO =
  'Escultura e entalhe em madeira maciça, à mão: arte sacra, fauna, figuras, relógios e molduras. Mais de 300 peças prontas e encomendas sob medida.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITULO_BASE, template: `%s | ${TITULO_BASE}` },
  description: DESCRICAO,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: `${brand.nome}, escultor entalhador`,
    title: TITULO_BASE,
    description: DESCRICAO,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Busto de Cristo entalhado em madeira por Carlos Oliveira' }],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/icon.png', apple: '/apple-touch-icon.png' },
  ...(VERIFICACAO_GOOGLE ? { verification: { google: VERIFICACAO_GOOGLE } } : {}),
}

export const viewport: Viewport = {
  themeColor: '#2A1E15',
}

/**
 * O Carlos em JSON-LD, em todas as páginas.
 *
 * É `Person` com `makesOffer`, e não `LocalBusiness`: não há endereço de
 * atendimento nem horário para declarar. Quando houver oficina aberta a
 * visita, vale trocar por `LocalBusiness` com `address` (ver LANCAMENTO.md).
 * Nada de `aggregateRating` enquanto não existirem avaliações reais.
 */
const pessoa = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#carlos`,
  name: brand.nome,
  jobTitle: brand.subtitulo,
  description: 'Escultor entalhador. Mais de 300 peças entalhadas à mão em madeira maciça.',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.jpg`,
  knowsAbout: ['Entalhe em madeira', 'Escultura em madeira', 'Arte sacra'],
  makesOffer: {
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: 'Escultura e entalhe em madeira sob encomenda' },
  },
  subjectOf: { '@type': 'Book', name: brand.livro.completo, inLanguage: 'pt-BR' },
}

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    // `suppressHydrationWarning`: a linha abaixo põe a classe `js` no <html>
    // antes de o React chegar, de propósito.
    <html lang="pt-BR" className={`${serifa.variable} ${texto.variable}`} suppressHydrationWarning>
      <head>
        {/* Avisa o CSS de que há JavaScript: só então o conteúdo pode nascer
            escondido para ser revelado ao rolar. Ver `.revelar` em globals.css. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pessoa) }} />
        {children}
      </body>
    </html>
  )
}
