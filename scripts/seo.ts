import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { Plugin } from 'vite'

// A extensão .js nos caminhos é exigência do moduleResolution node16 deste
// tsconfig; o arquivo em disco é .ts, e tanto o TypeScript quanto o Vite
// fazem essa correspondência sozinhos.
import { SITE_URL, TITULO_BASE, brand, linkInstagram } from '../src/lib/brand.js'

/**
 * Gera sitemap.xml, robots.txt e o JSON-LD do negócio durante o build.
 *
 * É gerado, e não escrito à mão em public/, porque catálogo à mão desatualiza:
 * bastaria adicionar uma peça e esquecer do sitemap para o endereço novo nunca
 * ser descoberto. Aqui a lista sai do mesmo array que monta o site.
 *
 * Só roda no build (`apply: 'build'`). Em desenvolvimento os arquivos não
 * existem, e tudo bem: quem os lê é robô de busca, que só vê produção.
 */

/** `&`, `<` e `>` quebram o XML se entrarem crus numa URL. */
function escaparXml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function montarSitemap(): string {
  // Uma página só: o acervo mora dentro dela, e a peça abre em visor,
  // não em rota própria. Não há outro endereço para o robô descobrir.
  const caminhos = ['/']

  /*
   * Sem <lastmod>, <changefreq> e <priority> de propósito.
   *
   * O Google ignora changefreq e priority faz anos. E lastmod só é usado
   * quando é confiável: preencher com a data do build faria todas as páginas
   * parecerem alteradas a cada deploy, inclusive as que não mudaram, o que
   * ensina o robô a desconfiar do campo. Melhor não afirmar nada.
   */
  const urls = caminhos
    .map((caminho) => `  <url>\n    <loc>${escaparXml(SITE_URL + caminho)}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function montarRobots(): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
}

/**
 * O Carlos em JSON-LD, injetado no index.html.
 *
 * Vai no HTML, e não num componente React, por dois motivos: é informação do
 * negócio, igual em todas as páginas, e assim não depende de o robô executar
 * JavaScript. Os valores saem de brand.ts, então continua havendo uma fonte
 * de verdade só.
 *
 * É `Person` com `makesOffer`, e não `LocalBusiness`: não há endereço de
 * atendimento nem horário de funcionamento para declarar. Quando houver
 * oficina aberta a visita, vale trocar por `LocalBusiness` com `address` —
 * declarar um negócio local sem endereço só rende aviso no Search Console.
 *
 * Nada de `aggregateRating` enquanto não existir perfil no Google: nota
 * inventada é o tipo de coisa que derruba o site inteiro da busca.
 */
function montarNegocio() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#carlos`,
    name: brand.nome,
    jobTitle: brand.subtitulo,
    description:
      'Escultor entalhador. Mais de 300 peças entalhadas à mão em madeira maciça: arte sacra, fauna, figuras, relógios e molduras.',
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: `+${brand.whatsapp}`,
    knowsAbout: ['Entalhe em madeira', 'Escultura em madeira', 'Arte sacra'],
    sameAs: [linkInstagram].filter((link): link is string => Boolean(link)),
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Escultura e entalhe em madeira sob encomenda',
        provider: { '@type': 'Person', name: brand.nome },
      },
    },
    subjectOf: {
      '@type': 'Book',
      name: brand.livro.completo,
      inLanguage: 'pt-BR',
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': SITE_URL, name: TITULO_BASE },
  }
}

export function pluginSeo(): Plugin {
  return {
    name: 'seo-carlos-oliveira',
    apply: 'build',

    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(montarNegocio()),
          injectTo: 'head',
        },
      ]
    },

    async closeBundle() {
      const destino = 'dist'
      await writeFile(join(destino, 'sitemap.xml'), montarSitemap(), 'utf8')
      await writeFile(join(destino, 'robots.txt'), montarRobots(), 'utf8')
    },
  }
}
