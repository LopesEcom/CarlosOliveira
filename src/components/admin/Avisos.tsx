'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { ContextoAvisos, type Tom } from '../../lib/admin/avisos'
import { cn } from '../../lib/utils'

interface Aviso {
  id: number
  texto: string
  tom: Tom
}

/** Avisos curtos de "salvo" e "não deu", no canto da tela. Sem biblioteca. */
export default function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])

  const avisar = useCallback((texto: string, tom: Tom = 'sucesso') => {
    const id = Date.now() + Math.random()
    setAvisos((atuais) => [...atuais, { id, texto, tom }])
    window.setTimeout(() => setAvisos((atuais) => atuais.filter((a) => a.id !== id)), 4500)
  }, [])

  const valor = useMemo(() => avisar, [avisar])

  return (
    <ContextoAvisos.Provider value={valor}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-20 right-4 z-[80] flex flex-col gap-2 lg:bottom-4">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role={aviso.tom === 'erro' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto max-w-sm border bg-branco px-4 py-3 text-sm shadow-md',
              aviso.tom === 'erro' ? 'border-erro text-erro' : 'border-sucesso text-sucesso',
            )}
          >
            {aviso.texto}
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  )
}
