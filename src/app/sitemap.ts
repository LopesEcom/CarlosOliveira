import type { MetadataRoute } from 'next'

import { SITE_URL } from '../lib/brand'
import { getPecas } from '../lib/dados/consultas'
import { caminhoPeca, menu } from '../lib/rotas'

/**
 * Sai das mesmas leituras que montam o site: peça nova cadastrada no painel
 * entra no sitemap sozinha. Sem `lastModified` de propósito: data de build
 * em toda página ensinaria o Google a desconfiar do campo.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pecas = await getPecas()
  return [
    { url: SITE_URL },
    ...menu.map((item) => ({ url: `${SITE_URL}${item.caminho}` })),
    ...pecas.map((peca) => ({ url: `${SITE_URL}${caminhoPeca(peca)}` })),
  ]
}
