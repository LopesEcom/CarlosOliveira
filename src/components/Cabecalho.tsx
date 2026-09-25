'use client'

import { Menu, Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { menu } from '../lib/rotas'
import { cn } from '../lib/utils'
import Assinatura from './Assinatura'
import BotaoWhatsapp from './BotaoWhatsapp'

/** Quanto rolar antes de o cabeçalho sumir ao descer. Menos que isso é tremor de dedo. */
const LIMIAR_ESCONDER = 160

/** No cabeçalho o início entra como link, como na referência; a logo também leva para lá. */
const LINKS = [{ caminho: '/', rotulo: 'Início' }, ...menu]

type Painel = 'menu' | 'busca' | null

/**
 * O CABEÇALHO.
 * ============
 *
 * No formato da referência que o Edson escolheu, sem a sacola (o site não
 * tem carrinho: a compra fecha no WhatsApp):
 *
 *   CELULAR      o menu à esquerda, a logo no centro e a lupa à direita.
 *   COMPUTADOR   a logo à esquerda, os links no centro, em letra de texto
 *                (Inter média, sem caixa alta), e a lupa na ponta direita.
 *
 * As duas formas são a mesma grade de três colunas (1fr, auto, 1fr): a do
 * meio fica no centro exato da página, qualquer que seja a largura do que
 * está nas pontas. No celular o meio é a logo; no computador, os links.
 *
 * A lupa abre um campo no alto da tela e leva o termo para a busca do
 * acervo (`/acervo?q=`), que já procura por número, nome, descrição,
 * madeira e tema. Não há uma segunda busca para manter.
 *
 * No celular os links vão para um painel de tela cheia, no escuro da
 * nogueira, com os nomes grandes: é um menu de seis itens, não precisa de
 * gaveta estreita.
 *
 * Ele some quando a pessoa desce e volta quando ela sobe: quem está descendo
 * está lendo, e quem sobe está procurando a saída.
 */
export default function Cabecalho() {
  const [rolado, setRolado] = useState(false)
  const [escondido, setEscondido] = useState(false)
  const [aberto, setAberto] = useState<Painel>(null)
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

  /* Trocar de página fecha o que estiver aberto. É o ajuste de estado na
     renderização que o React recomenda no lugar de um efeito: evita um
     quadro com o painel aberto sobre a página nova. */
  const [caminhoAnterior, setCaminhoAnterior] = useState(pathname)
  if (caminhoAnterior !== pathname) {
    setCaminhoAnterior(pathname)
    setAberto(null)
  }

  /* Painel aberto: trava a rolagem do fundo e o Esc fecha. */
  useEffect(() => {
    if (!aberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAberto(null)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = anterior
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  const claro = sobreCapa && !rolado
  const corIcone = claro ? 'text-creme' : 'text-tinta'
  const fechar = () => setAberto(null)

  return (
    <>
      <header
        className={cn(
          'inset-x-0 top-0 z-40 transition-[transform,background-color,border-color] duration-500 ease-suave',
          sobreCapa ? 'fixed' : 'sticky',
          claro
            ? 'border-b border-transparent bg-transparent'
            : 'border-b border-borda-sutil bg-branco/95 backdrop-blur-sm',
          escondido && !aberto && '-translate-y-full',
        )}
      >
        {/* `minmax(0, 1fr)` nas pontas: com `1fr` puro, a coluna dos dois
            ícones crescia até o tamanho deles e empurrava a logo para fora
            do centro no celular. */}
        <div className="container-site grid h-[4.5rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 md:h-20 lg:gap-6">
          <div className="-ml-2 flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setAberto('menu')}
              aria-expanded={aberto === 'menu'}
              aria-controls="menu-celular"
              aria-label="Abrir o menu"
              className={cn('inline-flex size-11 items-center justify-center', corIcone)}
            >
              <Menu size={22} strokeWidth={1.5} aria-hidden />
            </button>
          </div>

          <Link href="/" aria-label="Carlos Oliveira, página inicial" className="shrink-0 justify-self-center lg:justify-self-start">
            <Assinatura clara={claro} />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-9 lg:flex xl:gap-11">
            {LINKS.map((item) => (
              <Link
                key={item.caminho}
                href={item.caminho}
                aria-current={ativo(item.caminho, pathname) ? 'page' : undefined}
                className={cn(
                  'relative py-2 text-[0.9375rem] font-medium transition-colors duration-300 ease-suave',
                  claro ? 'text-creme hover:text-creme/70' : 'text-tinta hover:text-cinza',
                  /* O filete embaixo do item ativo é o "você está aqui". */
                  ativo(item.caminho, pathname) &&
                    cn('after:absolute after:inset-x-0 after:bottom-0.5 after:h-px', claro ? 'after:bg-creme' : 'after:bg-tinta'),
                )}
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          {/* A mesma lupa nas duas formas: na ponta direita, no celular e no
              computador. Com a nav escondida, ela cai sozinha na terceira coluna. */}
          <BotaoLupa
            aoAbrir={() => setAberto('busca')}
            aberta={aberto === 'busca'}
            className={cn('-mr-2 justify-self-end', corIcone)}
          />
        </div>
      </header>

      {aberto === 'menu' && <MenuCelular aoFechar={fechar} />}
      {aberto === 'busca' && <Busca aoFechar={fechar} />}
    </>
  )
}

function BotaoLupa({ aoAbrir, aberta, className }: { aoAbrir: () => void; aberta: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={aoAbrir}
      aria-expanded={aberta}
      aria-controls="busca-cabecalho"
      aria-label="Buscar uma peça"
      className={cn('inline-flex size-11 items-center justify-center', className)}
    >
      <Search size={20} strokeWidth={1.5} aria-hidden />
    </button>
  )
}

/** O item do menu da página atual. A página de uma peça também conta como acervo. */
function ativo(caminho: string, pathname: string): boolean {
  if (caminho === '/') return pathname === '/'
  return pathname === caminho || pathname.startsWith(`${caminho}/`) || (caminho === '/acervo' && pathname.startsWith('/peca/'))
}

/**
 * A BUSCA DO CABEÇALHO.
 * =====================
 *
 * Um campo no alto da tela, sobre um véu que fecha ao toque. Enviar leva ao
 * acervo com o termo; lá a pessoa continua refinando com os filtros.
 */
function Busca({ aoFechar }: { aoFechar: () => void }) {
  const router = useRouter()
  const [termo, setTermo] = useState('')

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    const busca = termo.trim()
    router.push(busca ? `/acervo?q=${encodeURIComponent(busca)}` : '/acervo')
    aoFechar()
  }

  return (
    <div id="busca-cabecalho" role="dialog" aria-modal="true" aria-label="Buscar uma peça" className="fixed inset-0 z-[55]">
      <button type="button" aria-label="Fechar a busca" onClick={aoFechar} className="absolute inset-0 bg-tinta/40" />
      <div className="relative border-b border-borda bg-branco">
        <form onSubmit={enviar} className="container-site flex h-[4.5rem] items-center gap-3 md:h-20" role="search">
          <Search size={20} strokeWidth={1.5} aria-hidden className="shrink-0 text-cinza" />
          <label className="min-w-0 flex-1">
            <span className="sr-only">Buscar por nome ou número</span>
            <input
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar: coruja, santa, 0012…"
              enterKeyHint="search"
              autoFocus
              /* 16px no mínimo: abaixo disso o Safari do iPhone dá zoom na
                 página ao focar o campo. */
              className="h-11 w-full bg-transparent text-base text-tinta outline-none placeholder:text-cinza [&::-webkit-search-cancel-button]:appearance-none"
            />
          </label>
          <button type="button" onClick={aoFechar} aria-label="Fechar a busca" className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center text-tinta">
            <X size={22} strokeWidth={1.5} aria-hidden />
          </button>
        </form>
      </div>
    </div>
  )
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
      <div className="container-site grid h-[4.5rem] shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 md:h-20">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar o menu"
          className="-ml-2 inline-flex size-11 items-center justify-center"
        >
          <X size={22} strokeWidth={1.5} aria-hidden />
        </button>
        <Link href="/" aria-label="Carlos Oliveira, página inicial" className="justify-self-center">
          <Assinatura clara />
        </Link>
      </div>

      <nav aria-label="Principal" className="container-site flex flex-1 flex-col justify-center py-10">
        <ol>
          {LINKS.map((item, indice) => (
            <li key={item.caminho} className="border-b border-creme/15 first:border-t">
              <Link
                href={item.caminho}
                onClick={aoFechar}
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
