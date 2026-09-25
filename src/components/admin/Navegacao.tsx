'use client'

import { BarChart3, Bookmark, Box, ExternalLink, FolderOpen, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition, type ComponentType } from 'react'

import { sair } from '../../app/admin/acoes/sessao'
import { cn } from '../../lib/utils'

interface Destino {
  href: string
  rotulo: string
  Icone: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

/**
 * Cinco destinos só (a Lennys tem cupons, links e mídias; o Carlos não
 * precisa), e por isso cabem todos na barra do celular, sem "Mais".
 */
const DESTINOS: Destino[] = [
  { href: '/admin', rotulo: 'Resultados', Icone: BarChart3 },
  { href: '/admin/pecas', rotulo: 'Peças', Icone: Box },
  { href: '/admin/colecoes', rotulo: 'Coleções', Icone: FolderOpen },
  { href: '/admin/etiquetas', rotulo: 'Etiquetas', Icone: Bookmark },
  { href: '/admin/configuracoes', rotulo: 'Ajustes', Icone: Settings },
]

const ativo = (href: string, pathname: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href))

/**
 * A NAVEGAÇÃO DO PAINEL.
 * ======================
 *
 * No celular, uma barra fixa embaixo, ícone sobre o rótulo, onde o polegar
 * alcança. No computador, a coluna da esquerda, com os mesmos ícones na
 * mesma ordem: muda o arranjo, não o vocabulário.
 */
export default function Navegacao({ usuario }: { usuario: string }) {
  const pathname = usePathname()
  const [saindo, iniciar] = useTransition()

  return (
    <>
      <nav aria-label="Painel" className="hidden w-60 shrink-0 flex-col border-r border-borda bg-branco px-3 py-5 lg:flex">
        <span className="px-3 pb-6 font-display text-h5">Painel do Carlos</span>
        <ul className="flex flex-1 flex-col gap-1">
          {DESTINOS.map(({ href, rotulo, Icone }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo(href, pathname) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  ativo(href, pathname) ? 'bg-borda-sutil font-semibold' : 'hover:bg-borda-sutil/60',
                )}
              >
                <Icone size={18} strokeWidth={1.5} />
                {rotulo === 'Ajustes' ? 'Configurações' : rotulo}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 border-t border-borda pt-4">
          <a href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm text-cinza hover:text-tinta">
            <ExternalLink size={16} strokeWidth={1.5} />
            Ver o site
          </a>
          <span className="truncate px-3 text-xs text-cinza" title={usuario}>
            {usuario}
          </span>
          <button
            type="button"
            disabled={saindo}
            onClick={() => iniciar(() => sair())}
            className="flex items-center gap-3 px-3 py-2 text-left text-sm text-cinza hover:text-tinta disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={1.5} />
            {saindo ? 'Saindo' : 'Sair'}
          </button>
        </div>
      </nav>

      <nav aria-label="Painel" className="fixed inset-x-0 bottom-0 z-50 flex border-t border-borda bg-branco lg:hidden">
        {DESTINOS.map(({ href, rotulo, Icone }) => (
          <Link
            key={href}
            href={href}
            aria-current={ativo(href, pathname) ? 'page' : undefined}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[0.6875rem]',
              ativo(href, pathname) ? 'font-semibold text-tinta' : 'text-cinza',
            )}
          >
            <Icone size={21} strokeWidth={1.5} />
            <span className="w-full truncate text-center">{rotulo}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
