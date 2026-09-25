import Link from 'next/link'
import type { ReactNode } from 'react'

import { kg, textoMedidas } from '../../lib/formato'
import { rotulosSituacao, rotulosTema, type Colecao, type Peca } from '../../lib/tipos'

/**
 * FICHA SEM INVENTAR.
 * ===================
 *
 * Madeira e medidas são o que quem compra precisa saber, e por isso as duas
 * linhas aparecem sempre, com "sob consulta" enquanto a ficha de papel não
 * chegar. Peso, ano e acabamento só aparecem quando existem: uma coluna de
 * "a informar" seria ruído.
 */
export default function FichaTecnica({ peca, colecoes }: { peca: Peca; colecoes: Colecao[] }) {
  const medidas = textoMedidas(peca)
  const daPeca = colecoes.filter((c) => peca.colecoes.includes(c.slug))

  return (
    <div>
      <h2 className="eyebrow">Ficha técnica</h2>
      <dl className="mt-4 border-t border-borda text-sm">
        <Linha rotulo="Número">{peca.numero}</Linha>
        <Linha rotulo="Tema">{rotulosTema[peca.tema]}</Linha>
        <Linha rotulo="Situação">{rotulosSituacao[peca.situacao]}</Linha>
        <Linha rotulo="Madeira">{peca.madeira ?? <SobConsulta />}</Linha>
        <Linha rotulo="Medidas">
          {medidas ? (
            <>
              {medidas}
              <span className="ml-2 text-cinza">(alt. × larg. × prof.)</span>
            </>
          ) : (
            <SobConsulta />
          )}
        </Linha>
        {peca.peso !== null && <Linha rotulo="Peso">{kg(peca.peso)}</Linha>}
        {peca.ano !== null && <Linha rotulo="Ano">{peca.ano}</Linha>}
        {peca.acabamento && <Linha rotulo="Acabamento">{peca.acabamento}</Linha>}
        {daPeca.length > 0 && (
          <Linha rotulo="Coleção">
            {daPeca.map((c, i) => (
              <span key={c.id}>
                {i > 0 && ', '}
                <Link
                  href={`/acervo?colecao=${c.slug}`}
                  className="underline decoration-borda underline-offset-4 transition-colors hover:decoration-tinta"
                >
                  {c.nome}
                </Link>
              </span>
            ))}
          </Linha>
        )}
      </dl>
    </div>
  )
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-borda py-3.5">
      <dt className="rotulo leading-6 text-cinza">{rotulo}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function SobConsulta() {
  return <span className="text-cinza">Sob consulta</span>
}
