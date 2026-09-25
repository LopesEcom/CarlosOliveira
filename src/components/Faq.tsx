'use client'

import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { perguntas } from '../data/faq'
import Revelar from './Revelar'

/**
 * Bloco 8, DÚVIDAS.
 *
 * Acordeão em <details>/<summary>: abre sem JavaScript, já vem com a
 * semântica certa para leitor de tela e é achável pelo Ctrl+F mesmo fechado.
 * Título à esquerda e perguntas à direita, na grade de 12 colunas, para o
 * bloco ler como página e não como lista.
 */
export default function Faq() {
  return (
    <section className="border-t border-borda-sutil bg-branco">
      <div className="container-site secao-g u-grid">
        <div className="col-4">
          <Revelar>
            <span className="eyebrow block">Dúvidas</span>
            <h2 className="mt-4 texto-display-sm">O que costumam perguntar</h2>
            <span className="filete mt-7" />
          </Revelar>
        </div>

        <ul className="col-7 deslocar-6 mt-6 border-t border-borda-sutil md:mt-0">
          {perguntas.map((item, indice) => (
            <Revelar key={item.id} como="li" distancia="curta" atraso={indice * 70} className="border-b border-borda-sutil">
              <ItemFaq pergunta={item.pergunta} resposta={item.resposta} />
            </Revelar>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ItemFaq({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false)

  return (
    <details
      open={aberto}
      onToggle={(e) => setAberto((e.currentTarget as HTMLDetailsElement).open)}
      className="group"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
        <h3 className="font-display text-h5 transition-colors duration-300 ease-suave group-hover:text-cinza">
          {pergunta}
        </h3>
        <span aria-hidden className="shrink-0 text-tinta">
          {aberto ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
        </span>
      </summary>

      <p className="max-w-2xl pb-7 leading-relaxed text-tinta/75">{resposta}</p>
    </details>
  )
}
