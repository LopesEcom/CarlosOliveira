'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { escreverEstado, ORDENACOES, PASSO_PAGINA, type EstadoAcervo, type OrdemAcervo } from '../../lib/dados/acervo'

/** Espera a pessoa parar de digitar antes de buscar: cada letra seria uma navegação. */
const ESPERA_BUSCA_MS = 400

interface BarraSuperiorProps {
  estado: EstadoAcervo
  total: number
  /** O botão "Filtrar" do celular, ao lado da ordem, que é onde se procura por ele. */
  filtro: ReactNode
}

/** Contagem, busca, filtro (no celular) e ordem, como na barra do acervo da Lennys. */
export default function BarraSuperior({ estado, total, filtro }: BarraSuperiorProps) {
  const router = useRouter()
  const [busca, setBusca] = useState(estado.busca ?? '')
  const ultimaEnviada = useRef(estado.busca ?? '')

  /* A URL manda: limpar os filtros (ou voltar no histórico) esvazia o campo. */
  const [buscaDaUrl, setBuscaDaUrl] = useState(estado.busca ?? '')
  if (buscaDaUrl !== (estado.busca ?? '')) {
    setBuscaDaUrl(estado.busca ?? '')
    setBusca(estado.busca ?? '')
    ultimaEnviada.current = estado.busca ?? ''
  }

  useEffect(() => {
    const termo = busca.trim()
    if (termo === ultimaEnviada.current) return
    const espera = window.setTimeout(() => {
      ultimaEnviada.current = termo
      router.replace(escreverEstado({ ...estado, busca: termo || undefined, mostrar: PASSO_PAGINA }), { scroll: false })
    }, ESPERA_BUSCA_MS)
    return () => window.clearTimeout(espera)
  }, [busca, estado, router])

  return (
    <div className="flex flex-col gap-4 border-b border-borda pb-4">
      <label className="relative block">
        <span className="sr-only">Buscar por nome ou número</span>
        <Search
          size={18}
          strokeWidth={1.5}
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cinza"
        />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar: coruja, santa, 0012…"
          enterKeyHint="search"
          className="input pl-11"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm">
          {total === 0 ? 'Nenhuma peça' : total === 1 ? '1 peça' : `${total} peças`}
        </p>

        {/* No celular, os controles ganham uma linha só deles e a ordem
            ocupa o que sobra: lado a lado com a contagem, passavam da tela. */}
        <div className="flex w-full items-center gap-3 sm:w-auto">
          {filtro}
          <label className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <span className="sr-only text-xs text-cinza sm:not-sr-only">Ordenar</span>
            <select
              value={estado.ordem}
              onChange={(e) =>
                router.push(escreverEstado({ ...estado, ordem: e.target.value as OrdemAcervo, mostrar: PASSO_PAGINA }), {
                  scroll: false,
                })
              }
              className="h-11 w-full min-w-0 cursor-pointer border border-borda bg-branco px-3 text-sm focus:border-tinta focus:outline-none sm:w-auto"
            >
              {ORDENACOES.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}
