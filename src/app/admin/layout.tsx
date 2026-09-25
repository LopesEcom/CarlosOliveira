import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import ProvedorAvisos from '../../components/admin/Avisos'
import Navegacao from '../../components/admin/Navegacao'
import { supabaseConfigurado } from '../../lib/supabase/env'
import { clienteServidor } from '../../lib/supabase/servidor'

export const metadata: Metadata = {
  title: { default: 'Painel', template: '%s | Painel do Carlos' },
  robots: { index: false, follow: false },
}

/**
 * A CASCA DO PAINEL.
 * ==================
 *
 * Navegação e conteúdo, sem nada do site público. Denso de propósito: é
 * ferramenta de uso repetido, não vitrine.
 *
 * Três estados:
 *  - Supabase não configurado: explica o que falta (o site continua no ar
 *    com as peças da planilha).
 *  - Sem sessão: só a tela de entrada, sem navegação (o proxy já barrou o
 *    resto).
 *  - Com sessão: navegação e a tela pedida.
 */
export default async function LayoutPainel({ children }: { children: ReactNode }) {
  if (!supabaseConfigurado()) return <SemSupabase />

  const supabase = await clienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div className="flex min-h-svh flex-col bg-branco">{children}</div>

  return (
    <ProvedorAvisos>
      <div className="flex min-h-svh flex-col bg-branco lg:flex-row">
        <Navegacao usuario={user.email ?? 'conta do Carlos'} />
        {/* O respiro embaixo é a altura da barra fixa do celular. */}
        <div className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</div>
      </div>
    </ProvedorAvisos>
  )
}

function SemSupabase() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-5 px-6 py-16">
      <span className="eyebrow">Painel do Carlos</span>
      <h1 className="texto-display-sm">O painel ainda não está ligado</h1>
      <p className="text-tinta/75">
        O painel guarda as peças, as fotos e as configurações no Supabase, e as chaves dele ainda não foram
        colocadas no site. Enquanto isso, o site mostra as peças da planilha e funciona normalmente.
      </p>
      <p className="text-tinta/75">
        Para ligar: siga o passo a passo do arquivo <code className="bg-borda-sutil px-1.5 py-0.5 text-sm">PAINEL.md</code>{' '}
        na pasta do projeto.
      </p>
      <a href="/" className="btn-contorno self-start">
        Voltar ao site
      </a>
    </main>
  )
}
