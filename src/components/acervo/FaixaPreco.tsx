'use client'

import { useState } from 'react'

interface FaixaPrecoProps {
  min: number
  max: number
  valorMin: number
  valorMax: number
  /** Disparado ao soltar o controle, não a cada pixel arrastado. */
  aoMudar: (min: number, max: number) => void
  formatar: (valor: number) => string
}

/**
 * Slider duplo de faixa de preço, o do acervo da Lennys.
 *
 * Dois `input[type=range]` sobrepostos em vez de um controle desenhado do
 * zero: teclado, leitor de tela e toque funcionam sem esforço. O valor só
 * vai para a URL ao soltar, senão cada pixel arrastado viraria uma navegação.
 */
export default function FaixaPreco({ min, max, valorMin, valorMax, aoMudar, formatar }: FaixaPrecoProps) {
  const [inicio, setInicio] = useState(valorMin)
  const [fim, setFim] = useState(valorMax)
  const [ultimos, setUltimos] = useState({ min: valorMin, max: valorMax })

  /* A URL manda: se ela mudar por fora (voltar no histórico, limpar
     filtros), o controle acompanha. Ajuste na renderização, e não em efeito,
     como o React recomenda para estado derivado de prop. */
  if (ultimos.min !== valorMin || ultimos.max !== valorMax) {
    setUltimos({ min: valorMin, max: valorMax })
    setInicio(valorMin)
    setFim(valorMax)
  }

  if (min >= max) return null

  const pctInicio = ((inicio - min) / (max - min)) * 100
  const pctFim = ((fim - min) / (max - min)) * 100
  const soltar = () => aoMudar(inicio, fim)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-6">
        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-borda" />
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-tinta"
          style={{ left: `${pctInicio}%`, right: `${100 - pctFim}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={inicio}
          aria-label="Preço mínimo"
          onChange={(e) => setInicio(Math.min(Number(e.target.value), fim))}
          onMouseUp={soltar}
          onTouchEnd={soltar}
          onKeyUp={soltar}
          className="faixa-preco__controle"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={fim}
          aria-label="Preço máximo"
          onChange={(e) => setFim(Math.max(Number(e.target.value), inicio))}
          onMouseUp={soltar}
          onTouchEnd={soltar}
          onKeyUp={soltar}
          className="faixa-preco__controle"
        />
      </div>
      <p className="text-xs text-cinza">
        {formatar(inicio)} até {formatar(fim)}
      </p>
    </div>
  )
}
