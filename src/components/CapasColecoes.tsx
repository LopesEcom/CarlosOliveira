import Image from 'next/image'
import Link from 'next/link'

import { capaDaColecao } from '../lib/dados/acervo'
import type { Colecao, Peca } from '../lib/tipos'
import { cn } from '../lib/utils'
import Revelar from './Revelar'

/**
 * AS CAPAS DAS COLEÇÕES.
 * ======================
 *
 * O formato da Lennys: foto em pé, escurecida embaixo, o nome da coleção e
 * "Ver todas". Filtro é lista de texto; quem ainda não sabe o que quer
 * escolhe pela foto.
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
  const comCapa = colecoes
    .map((colecao) => ({
      colecao,
      capa: capaDaColecao(colecao, pecas),
      total: pecas.filter((p) => p.colecoes.includes(colecao.slug)).length,
    }))
    .filter((c) => c.total > 0)

  return (
    <ul className={cn('grid gap-4 md:grid-cols-3', className)}>
      {comCapa.map(({ colecao, capa, total }, indice) => (
        <Revelar key={colecao.id} como="li" distancia="curta" atraso={indice * 90}>
          <Link href={`/acervo?colecao=${colecao.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-borda-sutil">
              {capa && (
                <Image
                  src={capa}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-suave group-hover:scale-[1.04]"
                />
              )}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-tinta/80 via-tinta/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6">
                <span className="font-display text-h3 leading-tight text-creme">{colecao.nome}</span>
                <span className="text-sm text-creme/80">{colecao.descricao}</span>
                <span className="rotulo border-b border-creme pb-1 text-creme">Ver as {total} peças</span>
              </span>
            </div>
          </Link>
        </Revelar>
      ))}
    </ul>
  )
}
