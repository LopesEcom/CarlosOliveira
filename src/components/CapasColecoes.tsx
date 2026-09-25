import Image from 'next/image'
import Link from 'next/link'

import { capaDaColecao } from '../lib/dados/acervo'
import type { Colecao, Peca } from '../lib/tipos'
import Esteira from './Esteira'
import Revelar from './Revelar'

/** Quanto tempo cada capa fica na tela, no celular, antes de dar a vez. */
const MS_POR_CAPA = 2000

/**
 * AS CAPAS DAS COLEÇÕES.
 * ======================
 *
 * No formato da Lennys: foto em pé, velada, o nome em caixa alta e "Ver
 * todas" sublinhado. Filtro é lista de texto; quem ainda não sabe o que quer
 * escolhe pela foto.
 *
 * Passam pela `Esteira`: uma por vez no celular, com as bolinhas embaixo;
 * duas no tablet; e no computador as três lado a lado, paradas.
 *
 * Server Component: os cartões são montados aqui, e a esteira só escolhe
 * quais aparecem.
 */
export default function CapasColecoes({
  colecoes,
  pecas,
  className,
}: {
  colecoes: Colecao[]
  pecas: Peca[]
  className?: string
}) {
  const itens = colecoes
    .map((colecao) => ({
      colecao,
      capa: capaDaColecao(colecao, pecas),
      total: pecas.filter((p) => p.colecoes.includes(colecao.slug)).length,
    }))
    .filter((c) => c.total > 0)
    .map(({ colecao, capa }) => ({
      chave: colecao.id,
      rotulo: `Ver a coleção ${colecao.nome}`,
      conteudo: <Capa nome={colecao.nome} slug={colecao.slug} capa={capa} />,
    }))

  return (
    <Revelar distancia="curta" className={className}>
      <Esteira itens={itens} lugares={{ base: 1, sm: 2, lg: 3 }} ms={MS_POR_CAPA} classeFileira="gap-4 sm:grid-cols-2 lg:grid-cols-3" />
    </Revelar>
  )
}

function Capa({ nome, slug, capa }: { nome: string; slug: string; capa: string | null }) {
  return (
    <Link href={`/acervo?colecao=${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-borda-sutil sm:aspect-[4/5]">
        {capa && (
          <Image
            src={capa}
            alt={`Peças da coleção ${nome}`}
            fill
            // Sem prioridade: a fileira fica abaixo da dobra em qualquer tela,
            // e o preload roubaria banda da capa do topo.
            loading="lazy"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-suave group-hover:scale-[1.04]"
          />
        )}
        <span aria-hidden className="absolute inset-0 bg-tinta/30" />
        <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6">
          <span className="font-display text-h3 uppercase leading-none tracking-wide text-creme">{nome}</span>
          <span className="rotulo border-b border-creme pb-1 text-creme">Ver todas</span>
        </span>
      </div>
    </Link>
  )
}
