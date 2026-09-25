'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { EstadoAcervo, Facetas } from '../../lib/dados/acervo'
import { cn } from '../../lib/utils'
import PainelFiltros from './PainelFiltros'

const FOCAVEIS = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])'

/**
 * O botão "Filtrar" e a gaveta que ele abre, abaixo de 1024px.
 *
 * As garantias do menu da Lennys: o fundo não rola, Esc fecha, o Tab circula
 * dentro da gaveta e o foco volta ao botão ao fechar.
 */
export default function FiltrosCelular({
  facetas,
  estado,
  ativos,
}: {
  facetas: Facetas
  estado: EstadoAcervo
  ativos: number
}) {
  const [aberto, setAberto] = useState(false)
  const gaveta = useRef<HTMLDivElement>(null)
  const botao = useRef<HTMLButtonElement>(null)
  const fechar = useCallback(() => setAberto(false), [])

  useEffect(() => {
    if (!aberto) return
    const origem = botao.current
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    gaveta.current?.querySelector<HTMLElement>(FOCAVEIS)?.focus()

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        fechar()
        return
      }
      if (evento.key !== 'Tab') return
      const alvos = gaveta.current?.querySelectorAll<HTMLElement>(FOCAVEIS)
      if (!alvos?.length) return
      const primeiro = alvos[0]
      const ultimo = alvos[alvos.length - 1]
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = anterior
      origem?.focus()
    }
  }, [aberto, fechar])

  return (
    <div className="lg:hidden">
      <button ref={botao} type="button" onClick={() => setAberto(true)} className="btn-contorno btn-sm gap-2">
        <SlidersHorizontal size={15} strokeWidth={1.75} aria-hidden />
        Filtrar
        {ativos > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-tinta text-[0.6875rem] text-creme">
            {ativos}
          </span>
        )}
      </button>

      <div className={cn(!aberto && 'pointer-events-none')} aria-hidden={!aberto}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Fechar filtros"
          onClick={fechar}
          className={cn(
            'fixed inset-0 z-[55] bg-tinta/40 transition-opacity duration-300 ease-suave',
            aberto ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          ref={gaveta}
          role="dialog"
          aria-modal={aberto || undefined}
          aria-label="Filtros do acervo"
          className={cn(
            'fixed inset-y-0 left-0 z-[56] flex w-[85%] max-w-sm flex-col bg-branco transition-transform duration-300 ease-suave',
            aberto ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-borda px-5 py-3">
            <h2 className="rotulo text-tinta">Filtros</h2>
            <button type="button" onClick={fechar} className="-mr-2 inline-flex size-11 items-center justify-center">
              <X size={20} strokeWidth={1.5} aria-hidden />
              <span className="sr-only">Fechar filtros</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-7">
            <PainelFiltros facetas={facetas} estado={estado} aoAplicar={fechar} idPrefixo="celular" />
          </div>
        </div>
      </div>
    </div>
  )
}
