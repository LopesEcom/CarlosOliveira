'use client'

import { Check, Maximize2, Plus } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { registrarEvento } from '../../app/acoes/eventos'
import { itemDaPeca } from '../../lib/mensagens'
import { useSelecao } from '../../lib/selecao'
import { podeComprar, type Peca } from '../../lib/tipos'
import { cn } from '../../lib/utils'
import Visor from '../Visor'

/**
 * A foto grande, as miniaturas, e o visor em tela cheia com zoom.
 *
 * A foto aqui é inteira (`object-contain`), e não o recorte 3:4 da grade: na
 * página da peça a pessoa quer ver a escultura toda, base e topo. O zoom e o
 * arrasto ficam no visor.
 *
 * É também quem conta a visita da peça para o painel, uma vez por abertura.
 */
export default function Galeria({ peca }: { peca: Peca }) {
  const { marcada, alternar } = useSelecao()
  const [atual, setAtual] = useState(0)
  const [visorAberto, setVisorAberto] = useState(false)
  const escolhida = marcada(peca.slug)
  const fotos = peca.imagens

  useEffect(() => {
    void registrarEvento('visita_peca', peca.id)
  }, [peca.id])

  if (!fotos.length) {
    return <div className="aspect-[4/5] w-full bg-borda-sutil" />
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setVisorAberto(true)}
        className="group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-branco"
        aria-label={`Ampliar a foto ${atual + 1} de ${peca.nome}`}
      >
        <Image
          src={fotos[atual]}
          alt={`${peca.nome}, peça entalhada em madeira por Carlos Oliveira. Foto ${atual + 1} de ${fotos.length}.`}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-contain"
        />
        <span className="rotulo-sm absolute bottom-3 right-3 inline-flex items-center gap-2 bg-tinta/75 px-3 py-2 text-creme transition-colors duration-300 ease-suave group-hover:bg-tinta">
          <Maximize2 size={13} strokeWidth={1.75} aria-hidden />
          Ampliar
        </span>
      </button>

      {fotos.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {fotos.map((foto, indice) => (
            <li key={foto}>
              <button
                type="button"
                onClick={() => setAtual(indice)}
                aria-label={`Ver a foto ${indice + 1}`}
                aria-current={indice === atual}
                className={cn(
                  'relative block size-16 overflow-hidden border-2 bg-branco transition-all duration-300 ease-suave sm:size-20',
                  indice === atual ? 'border-tinta' : 'border-transparent opacity-60 hover:opacity-100',
                )}
              >
                <Image src={foto} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {visorAberto && (
        <Visor
          imagens={fotos}
          indiceInicial={atual}
          nome={peca.nome}
          aoFechar={(indiceFinal) => {
            setAtual(indiceFinal)
            setVisorAberto(false)
          }}
          acao={
            podeComprar(peca) && (
              <button
                type="button"
                onClick={() => alternar(itemDaPeca(peca))}
                aria-pressed={escolhida}
                className={cn(
                  'rotulo mr-2 inline-flex h-11 items-center gap-2 px-4 transition-colors duration-300 ease-suave',
                  escolhida ? 'bg-branco text-tinta' : 'bg-creme/10 text-creme hover:bg-creme/25',
                )}
              >
                {escolhida ? <Check size={16} strokeWidth={1.75} /> : <Plus size={16} strokeWidth={1.5} />}
                <span className="hidden sm:inline">{escolhida ? 'Escolhida' : 'Escolher'}</span>
              </button>
            )
          }
        />
      )}
    </div>
  )
}
