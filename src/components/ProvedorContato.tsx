'use client'

import type { ReactNode } from 'react'

import { ContextoContato } from '../lib/contato'
import type { Configuracoes } from '../lib/tipos'

/** Entrega as Configurações (lidas no servidor, pelo layout) aos componentes do navegador. */
export default function ProvedorContato({ valor, children }: { valor: Configuracoes; children: ReactNode }) {
  return <ContextoContato.Provider value={valor}>{children}</ContextoContato.Provider>
}
