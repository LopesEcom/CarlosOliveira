import type { MetadataRoute } from 'next'

import { SITE_URL } from '../lib/brand'

/** O painel fica fora da busca; o resto é aberto. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
