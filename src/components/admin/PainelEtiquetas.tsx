'use client'

import { useState, useTransition } from 'react'

import { criarEtiqueta, excluirEtiqueta, renomearEtiqueta } from '../../app/admin/acoes/etiquetas'
import type { Etiqueta } from '../../lib/admin/consultas'
import { LIMITE_ETIQUETA } from '../../lib/admin/peca'
import { useAvisos } from '../../lib/admin/avisos'

/**
 * As sugestões de selo ("Novidade", "Última peça"). Mexer aqui não muda
 * nenhuma peça: apagar uma sugestão não tira o selo de quem já usa, e a
 * contagem ao lado diz quantas peças usam cada uma.
 */
export default function PainelEtiquetas({ etiquetas }: { etiquetas: Etiqueta[] }) {
  const avisar = useAvisos()
  const [nova, setNova] = useState('')
  const [ocupado, iniciar] = useTransition()

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <ul className={ocupado ? 'border-t border-borda opacity-60' : 'border-t border-borda'}>
        {etiquetas.map((e) => (
          <Linha key={e.id} etiqueta={e} />
        ))}
      </ul>

      <form
        onSubmit={(ev) => {
          ev.preventDefault()
          iniciar(async () => {
            const r = await criarEtiqueta(nova)
            if (r.ok) {
              avisar(`"${nova.trim()}" entrou na lista.`)
              setNova('')
            } else avisar(r.erro ?? 'Não foi possível salvar.', 'erro')
          })
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="block flex-1">
          <span className="label">Nova etiqueta</span>
          <input value={nova} onChange={(e) => setNova(e.target.value)} maxLength={LIMITE_ETIQUETA} placeholder="Ex.: Novidade" className="input" />
        </label>
        <button type="submit" className="btn-contorno btn-sm">
          Acrescentar
        </button>
      </form>
    </div>
  )
}

function Linha({ etiqueta }: { etiqueta: Etiqueta }) {
  const avisar = useAvisos()
  const [texto, setTexto] = useState(etiqueta.texto)
  const [, iniciar] = useTransition()

  return (
    <li className="flex items-center gap-3 border-b border-borda py-3">
      <input
        aria-label={`Etiqueta ${etiqueta.texto}`}
        value={texto}
        maxLength={LIMITE_ETIQUETA}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={() => {
          if (texto.trim() === etiqueta.texto) return
          iniciar(async () => {
            const r = await renomearEtiqueta(etiqueta.id, texto)
            if (!r.ok) setTexto(etiqueta.texto)
            avisar(r.ok ? 'Etiqueta renomeada.' : (r.erro ?? 'Não foi possível salvar.'), r.ok ? 'sucesso' : 'erro')
          })
        }}
        className="h-10 flex-1 border border-borda px-3 text-sm"
      />
      <span className="w-20 text-xs text-cinza">{etiqueta.usos === 1 ? '1 peça' : `${etiqueta.usos} peças`}</span>
      <button
        type="button"
        onClick={() =>
          iniciar(async () => {
            const r = await excluirEtiqueta(etiqueta.id)
            avisar(r.ok ? `"${etiqueta.texto}" saiu da lista.` : (r.erro ?? 'Não foi possível apagar.'), r.ok ? 'sucesso' : 'erro')
          })
        }
        className="text-sm text-cinza underline underline-offset-4 hover:text-erro"
      >
        Tirar
      </button>
    </li>
  )
}
