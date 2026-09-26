import { brand } from './brand'
import type { Peca } from './tipos'

/**
 * OS ENDEREÇOS DO SITE, NUM LUGAR SÓ.
 * ===================================
 *
 * O menu, o rodapé e o sitemap (src/app/sitemap.ts) leem daqui. Página nova
 * entra nesta lista e no src/app/.
 */

/** O endereço da página de uma peça: `/peca/0002-coruja`. */
export function caminhoPeca(peca: Pick<Peca, 'slug'>): string {
  return `/peca/${peca.slug}`
}

/**
 * Para onde vai o "Aprender a fazer" da página de cada peça.
 *
 * A apostila da Escola Oficina Arte Pira, com o método do Carlos (endereço
 * de fora, abre em outra aba). O link mora em `brand.livro.link`: se a
 * apostila mudar de endereço, é lá que troca, e as peças acompanham.
 */
export const CAMINHO_APRENDER = brand.livro.link

/** Endereço de fora do site: abre em outra aba, sem o `<Link>` do Next. */
export function ehExterno(caminho: string): boolean {
  return /^https?:\/\//.test(caminho)
}

export interface ItemMenu {
  caminho: string
  rotulo: string
}

/** A ordem é a do cabeçalho e do rodapé. O início fica na assinatura. */
export const menu: ItemMenu[] = [
  { caminho: '/acervo', rotulo: 'Acervo' },
  { caminho: '/historia', rotulo: 'História' },
  { caminho: '/livro', rotulo: 'O livro' },
  { caminho: '/escola', rotulo: 'Escola' },
  { caminho: '/contato', rotulo: 'Contato' },
]
