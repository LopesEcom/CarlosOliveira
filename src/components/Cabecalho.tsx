'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { menu } from '../lib/rotas'
import { cn } from '../lib/utils'
import Assinatura from './Assinatura'
import BotaoWhatsapp from './BotaoWhatsapp'

/** Quanto rolar antes de o cabeçalho sumir ao descer. Menos que isso é tremor de dedo. */
const LIMIAR_ESCONDER = 160

/**
 * O CABEÇALHO, QUE A PÁGINA ÚNICA NÃO TINHA.
 * ==========================================
 *
 * Na landing, barra fixa era chrome de site num lugar que queria ser
 * apresentação. Com páginas de verdade (acervo, peça, história, livro,
 * escola) a pessoa precisa saber onde está e como ir para o lado, e isso é
 * trabalho de cabeçalho.
 *
 * Ele some quando a pessoa desce e volta quando ela sobe: quem está descendo
 * está lendo, e quem sobe está procurando a saída. Assim o menu está à mão
 * sem comer a altura da tela do celular o tempo todo.
 *
 * No celular os links vão para um painel de tela cheia, no escuro da
 * nogueira, com os nomes grandes: é um menu de cinco itens, não precisa de
 * gaveta estreita.
 */
export default function Cabecalho() {
  const [rolado, setRolado] = useState(false)
  const [escondido, setEscondido] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const ultimoY = useRef(0)
  const pathname = usePathname()
  /* Na página inicial o cabeçalho flutua transparente sobre a foto da capa,
     em creme. Nas outras ele ocupa o próprio espaço, sobre o branco. */
  const sobreCapa = pathname === '/'

  useEffect(() => {
    function aoRolar() {
      const y = window.scrollY
      setRolado(y > 8)
      setEscondido(y > LIMIAR_ESCONDER && y > ultimoY.current)
      ultimoY.current = y
    }
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  /* Trocar de página fecha o menu. É o ajuste de estado na renderização que o
     React recomenda no lugar de um efeito: evita um quadro com o menu aberto
     sobre a página nova. */
  const [caminhoAnterior, setCaminhoAnterior] = useState(pathname)
  if (caminhoAnterior !== pathname) {
    setCaminhoAnterior(pathname)
    setMenuAberto(false)
  }

  /* Menu aberto: trava a rolagem do fundo e o Esc fecha. */
  useEffect(() => {
    if (!menuAberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = anterior
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [menuAberto])

  const claro = sobreCapa && !rolado

  return (
    <>
      <header
        className={cn(
          'inset-x-0 top-0 z-40 transition-[transform,background-color,border-color] duration-500 ease-suave',
          sobreCapa ? 'fixed' : 'sticky',
          claro
            ? 'border-b border-transparent bg-transparent'
            : 'border-b border-borda-sutil bg-branco/95 backdrop-blur-sm',
          escondido && !menuAberto && '-translate-y-full',
        )}
      >
        <div className="container-site flex h-[4.5rem] items-center justify-between gap-6 md:h-20">
          <Link href="/" aria-label="Carlos Oliveira, página inicial" className="min-w-0">
            <Assinatura clara={claro} />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
            {menu.map((item) => (
              <Link
                key={item.caminho}
                href={item.caminho}
                aria-current={ativo(item.caminho, pathname) ? 'page' : undefined}
                className={cn(
                    'relative py-2 rotulo transition-colors duration-300 ease-suave',
                    claro ? 'text-creme hover:text-creme/70' : 'text-tinta hover:text-cinza',
                    /* O filete embaixo do item ativo é o "você está aqui". A
                       página de uma peça também conta como acervo. */
                    ativo(item.caminho, pathname) &&
                      cn('after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px', claro ? 'after:bg-branco' : 'after:bg-tinta'),
                  )}
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          {/* No celular estreito, só o ícone: a palavra "Menu" roubava a
              largura de que o nome precisa para não ser cortado. */}
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-expanded={menuAberto}
            aria-controls="menu-celular"
            aria-label="Abrir o menu"
            className={cn(
              '-mr-2 inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2.5 px-2 rotulo lg:hidden',
              claro ? 'text-creme' : 'text-tinta',
            )}
          >
            <span aria-hidden className="hidden sm:inline">Menu</span>
            <Menu size={22} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </header>

      {menuAberto && <MenuCelular aoFechar={() => setMenuAberto(false)} />}
    </>
  )
}

/** O item do menu da página atual. A página de uma peça também conta como acervo. */
function ativo(caminho: string, pathname: string): boolean {
  return pathname === caminho || pathname.startsWith(`${caminho}/`) || (caminho === '/acervo' && pathname.startsWith('/peca/'))
}

function MenuCelular({ aoFechar }: { aoFechar: () => void }) {
  const painel = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  /* O foco vai para dentro do painel ao abrir, senão o Tab continua
     andando pela página escondida atrás dele. */
  useEffect(() => {
    painel.current?.focus()
  }, [])

  return (
    <div
      ref={painel}
      id="menu-celular"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      tabIndex={-1}
      className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-tinta text-creme outline-none lg:hidden"
    >
      <div className="container-site flex h-[4.5rem] shrink-0 items-center justify-between gap-6 md:h-20">
        <Link href="/" aria-label="Carlos Oliveira, página inicial" className="min-w-0">
          <Assinatura clara />
        </Link>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar o menu"
          className="-mr-2 inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2.5 px-2 rotulo"
        >
          <span aria-hidden className="hidden sm:inline">Fechar</span>
          <X size={22} strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <nav aria-label="Principal" className="container-site flex flex-1 flex-col justify-center py-10">
        <ol>
          {menu.map((item, indice) => (
            <li key={item.caminho} className="border-b border-creme/15 first:border-t">
              <Link
                href={item.caminho}
                aria-current={ativo(item.caminho, pathname) ? 'page' : undefined}
                className={cn(
                  'flex items-baseline gap-5 py-5 font-display text-h1',
                  ativo(item.caminho, pathname) ? 'text-creme' : 'text-creme/75',
                )}
              >
                <span className="text-h6 text-creme rebaixado">{String(indice + 1).padStart(2, '0')}</span>
                {item.rotulo}
              </Link>
            </li>
          ))}
        </ol>

        <BotaoWhatsapp
          variante="claro"
          className="mt-12 self-start"
          mensagem="Olá, Carlos! Vim pelo seu site e gostaria de conversar sobre uma peça."
        >
          Falar com o Carlos
        </BotaoWhatsapp>
      </nav>
    </div>
  )
}
