'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { ContextoSelecao, type ItemSelecao } from '../lib/selecao'

/** `v2`: a versão anterior guardava só os ids, no tempo da página única. */
const CHAVE = 'carlos-oliveira:selecao:v2'

/**
 * Lê a seleção salva, conferindo o formato item por item.
 *
 * O navegador pode recusar o armazenamento (aba anônima, cookies
 * bloqueados), e nesse caso a seleção só vale enquanto a página está aberta:
 * o `try` é o que impede isso de derrubar o site.
 */
function lerSalvos(): ItemSelecao[] {
  try {
    const lista: unknown = JSON.parse(localStorage.getItem(CHAVE) ?? '[]')
    if (!Array.isArray(lista)) return []
    return lista.filter(
      (item): item is ItemSelecao =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ItemSelecao).slug === 'string' &&
        typeof (item as ItemSelecao).numero === 'string' &&
        typeof (item as ItemSelecao).nome === 'string',
    )
  } catch {
    return []
  }
}

export default function ProvedorSelecao({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemSelecao[]>([])
  /*
    A leitura é num efeito, e não no estado inicial: o HTML sai do servidor sem
    seleção, e a primeira renderização no navegador tem de bater com ele. Só
    depois a lista salva entra, e só depois dela a gravação começa, senão o
    primeiro render apagaria o que estava salvo.
  */
  const [carregada, setCarregada] = useState(false)

  useEffect(() => {
    setItens(lerSalvos())
    setCarregada(true)
  }, [])

  useEffect(() => {
    if (!carregada) return
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens))
    } catch {
      /* Sem armazenamento a seleção continua valendo nesta visita. */
    }
  }, [itens, carregada])

  const alternar = useCallback((item: ItemSelecao) => {
    setItens((atual) => (atual.some((i) => i.slug === item.slug) ? atual.filter((i) => i.slug !== item.slug) : [...atual, item]))
  }, [])

  const remover = useCallback((slug: string) => setItens((atual) => atual.filter((i) => i.slug !== slug)), [])
  const limpar = useCallback(() => setItens([]), [])
  const marcada = useCallback((slug: string) => itens.some((i) => i.slug === slug), [itens])

  const valor = useMemo(() => ({ itens, marcada, alternar, remover, limpar }), [itens, marcada, alternar, remover, limpar])

  return <ContextoSelecao.Provider value={valor}>{children}</ContextoSelecao.Provider>
}
