'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { useMovimentoReduzido } from '../lib/movimento'
import { cn } from '../lib/utils'

export interface ItemEsteira {
  /** Estável e única. Trocar a chave de um lugar remonta o cartão e roda a entrada de novo. */
  chave: string
  /** Rótulo da bolinha. Ex.: "Ver a coleção Devoção". */
  rotulo: string
  /** O cartão pronto, montado no servidor: a esteira só escolhe quais aparecem. */
  conteudo: ReactNode
}

/**
 * Quantos lugares a fileira tem, por largura. Objeto e não função porque
 * atravessa do servidor para o navegador, e função não atravessa.
 */
export interface LugaresEsteira {
  /** Celular. Também é o que o servidor desenha, antes de medir a tela. */
  base: number
  /** A partir de 640 px. */
  sm?: number
  /** A partir de 1024 px. */
  lg?: number
}

/**
 * A ESTEIRA, a mesma da Lennys.
 * =============================
 *
 * Uma fileira de tamanho fixo por onde os itens passam: com mais itens que
 * lugares, eles andam para a esquerda e o que sai volta pela direita, a cada
 * `ms`. No celular é um cartão por vez, na largura toda, com as bolinhas
 * embaixo dizendo quantos são e deixando ir direto a um deles.
 *
 * Para no primeiro toque ou quando o foco entra (o cartão é um link, e
 * trocar embaixo do dedo abriria o errado), e não gira para quem pediu menos
 * movimento.
 *
 * O servidor desenha sempre `base` lugares, o do celular. Começar pelo maior
 * faria o celular nascer com cartões a mais e encolher depois, com as fotos
 * sumidas já baixadas. No computador os lugares crescem depois da medida, e
 * como as colunas da grade são fixas no CSS, não há salto de altura.
 */
export default function Esteira({
  itens,
  lugares,
  ms,
  classeFileira,
}: {
  itens: ItemEsteira[]
  lugares: LugaresEsteira
  ms: number
  /** Classes da fileira: as colunas e o espaçamento. */
  classeFileira: string
}) {
  const { base, sm, lg } = lugares
  const [atual, setAtual] = useState(0)
  const [parado, setParado] = useState(false)
  const [quantos, setQuantos] = useState(base)
  const semMovimento = useMovimentoReduzido()

  useEffect(() => {
    const medir = () => {
      const largura = window.innerWidth
      if (largura >= 1024) setQuantos(lg ?? sm ?? base)
      else if (largura >= 640) setQuantos(sm ?? base)
      else setQuantos(base)
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [base, sm, lg])

  // Só gira quando há mais item que lugar.
  const gira = itens.length > quantos

  useEffect(() => {
    if (!gira || parado || semMovimento) return
    const id = window.setInterval(() => setAtual((i) => (i + 1) % itens.length), ms)
    return () => window.clearInterval(id)
  }, [gira, parado, semMovimento, itens.length, ms])

  const mostrados = Array.from(
    { length: Math.min(quantos, itens.length) },
    (_, posicao) => itens[(atual + posicao) % itens.length],
  )

  return (
    <div className="flex flex-col gap-4">
      <ul
        onPointerDown={() => setParado(true)}
        onFocusCapture={() => setParado(true)}
        className={cn('grid', classeFileira)}
      >
        {mostrados.map((item, posicao) => (
          <li key={posicao} className="h-full">
            <div key={item.chave} className={cn('h-full', gira && 'esteira-entrando')}>
              {item.conteudo}
            </div>
          </li>
        ))}
      </ul>

      {/* Uma bolinha por item. Só aparecem quando a fileira gira: parada,
          todos já estão à vista. A área de toque é maior que o ponto. */}
      {gira && (
        <div className="flex justify-center">
          {itens.map((item, indice) => {
            const ativa = itens[atual].chave === item.chave
            return (
              <button
                key={item.chave}
                type="button"
                aria-label={item.rotulo}
                aria-current={ativa ? 'true' : undefined}
                onClick={() => {
                  setAtual(indice)
                  setParado(true)
                }}
                className="inline-flex size-7 items-center justify-center"
              >
                <span
                  aria-hidden
                  className={cn(
                    'block rounded-full transition-all duration-300 ease-suave',
                    ativa ? 'size-3 border-2 border-tinta bg-branco p-px' : 'size-2 bg-cinza/60',
                  )}
                >
                  {ativa && <span className="block size-full rounded-full bg-tinta" />}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
