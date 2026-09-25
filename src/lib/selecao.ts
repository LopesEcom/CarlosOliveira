'use client'

import { createContext, useContext } from 'react'

/**
 * A SELEÇÃO, ENTRE PÁGINAS.
 * =========================
 *
 * A pessoa marca uma peça no acervo, abre outra, volta, marca mais uma: a
 * lista atravessa as páginas. Mora num contexto acima das rotas (ver
 * ProvedorSelecao) e fica guardada no navegador.
 *
 * Cada item guarda o que a mensagem e a revisão precisam (número, nome,
 * endereço, capa, preço) no momento em que foi marcado. Assim a barra e a
 * revisão não precisam do acervo inteiro na página, que agora vem do banco e
 * pode ter trezentas peças.
 */
export interface ItemSelecao {
  slug: string
  numero: string
  nome: string
  capa: string | null
  /** "R$ 1.200", ou `null` quando é sob consulta. */
  preco: string | null
}

export interface Selecao {
  itens: readonly ItemSelecao[]
  marcada: (slug: string) => boolean
  alternar: (item: ItemSelecao) => void
  remover: (slug: string) => void
  limpar: () => void
}

export const ContextoSelecao = createContext<Selecao | null>(null)

export function useSelecao(): Selecao {
  const selecao = useContext(ContextoSelecao)
  if (!selecao) throw new Error('useSelecao precisa estar dentro do <ProvedorSelecao>.')
  return selecao
}
