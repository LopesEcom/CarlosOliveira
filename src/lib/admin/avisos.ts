'use client'

import { createContext, useContext } from 'react'

export type Tom = 'sucesso' | 'erro'

/** Os avisos de "salvo" e "não deu" do painel. O provedor é components/admin/Avisos.tsx. */
export const ContextoAvisos = createContext<((texto: string, tom?: Tom) => void) | null>(null)

export function useAvisos() {
  const avisar = useContext(ContextoAvisos)
  if (!avisar) throw new Error('useAvisos precisa estar dentro do <ProvedorAvisos>.')
  return avisar
}
