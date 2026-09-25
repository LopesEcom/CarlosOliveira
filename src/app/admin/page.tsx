import Link from 'next/link'
import type { ReactNode } from 'react'

import Grafico from '../../components/admin/Grafico'
import { DIAS_DO_RESUMO, getResumo } from '../../lib/admin/consultas'
import { exigirSessao } from '../../lib/admin/sessao'

// A página mora no mesmo segmento do layout do painel, e o modelo de título
// ("%s | Painel do Carlos") só vale para os segmentos filhos: por isso o
// título inteiro vai aqui.
export const metadata = { title: { absolute: 'Resultados | Painel do Carlos' } }

/**
 * RESULTADOS.
 * ===========
 *
 * Os números dos últimos 30 dias, tirados das visitas e dos cliques do site.
 * A tabela das peças mais vistas é a mais útil: peça com muita visita e
 * pouco clique costuma ter um problema que se resolve (foto, preço,
 * descrição).
 */
export default async function Resultados() {
  await exigirSessao()
  const r = await getResumo()

  return (
    <main className="flex flex-col gap-8 p-6 lg:p-10">
      <header>
        <h1 className="texto-display-sm">Resultados</h1>
        <p className="mt-2 text-sm text-cinza">Últimos {DIAS_DO_RESUMO} dias.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Cartao rotulo="Peças no site" valor={r.pecasNoAr} />
        <Cartao rotulo="Visitas a peças" valor={r.visitas} detalhe="Páginas de peça abertas" />
        <Cartao rotulo="Conversas no WhatsApp" valor={r.cliquesWhatsapp} detalhe="Cliques em comprar ou perguntar" />
        <Cartao rotulo="Quiseram aprender" valor={r.cliquesAprender} detalhe="Cliques em aprender a fazer" />
      </section>

      {r.vazio ? (
        <section className="border border-borda bg-borda-sutil/40 p-8">
          <h2 className="text-h4">Ainda não há movimento para mostrar</h2>
          <p className="mt-2 max-w-prose text-sm text-cinza">
            Os números aparecem sozinhos conforme as pessoas visitam o site e clicam para falar com o senhor. Nada
            precisa ser configurado.
          </p>
        </section>
      ) : (
        <>
          <section className="border border-borda p-4 lg:p-6">
            <h2 className="text-sm font-semibold">Conversas no WhatsApp por dia</h2>
            <div className="mt-4">
              <Grafico dados={r.porDia} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Peças mais vistas</h2>
            {r.ranking.length === 0 ? (
              <p className="mt-2 text-sm text-cinza">Nenhuma peça foi aberta no período.</p>
            ) : (
              <div className="mt-3 overflow-x-auto border border-borda">
                <table className="w-full min-w-[24rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-borda">
                      {['Peça', 'Visitas', 'Conversas'].map((t) => (
                        <th key={t} scope="col" className="rotulo p-3 text-cinza">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.ranking.map((p) => (
                      <tr key={p.id} className="border-b border-borda last:border-0">
                        <td className="p-3">
                          <Link href={`/peca/${p.slug}`} target="_blank" className="hover:underline">
                            Nº {p.numero} · {p.nome}
                          </Link>
                        </td>
                        <td className="p-3">{p.visitas}</td>
                        <td className="p-3">{p.cliques}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

function Cartao({ rotulo, valor, detalhe }: { rotulo: string; valor: ReactNode; detalhe?: string }) {
  return (
    <div className="flex flex-col gap-1 border border-borda p-5">
      <span className="rotulo text-cinza">{rotulo}</span>
      <span className="font-display text-[2.5rem] leading-none">{valor}</span>
      {detalhe && <span className="text-xs text-cinza">{detalhe}</span>}
    </div>
  )
}
