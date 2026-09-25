import Image from 'next/image'

import type { Colecao } from '../../lib/tipos'

/**
 * A capa da coleção, no topo do acervo filtrado por ela.
 *
 * Como na Lennys: ver "Para a parede" escrito grande sobre a foto certa diz
 * onde a pessoa está mais depressa que uma caixinha marcada na coluna do
 * lado. Mais baixa que a capa do início: aqui a pessoa já decidiu o que quer
 * ver, a capa situa, não segura.
 */
export default function CapaColecao({ colecao, capa, pecas }: { colecao: Colecao; capa: string | null; pecas: number }) {
  return (
    <section className="relative flex h-[42svh] min-h-64 items-end overflow-hidden bg-tinta">
      {capa && <Image src={capa} alt="" fill priority sizes="100vw" className="object-cover object-[center_35%]" />}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-tinta/85 via-tinta/30 to-tinta/10" />
      <div className="container-site relative pb-10 md:pb-14">
        <span className="rotulo text-creme/80">Coleção · {pecas === 1 ? '1 peça' : `${pecas} peças`}</span>
        <h1 className="mt-3 texto-display text-creme">{colecao.nome}</h1>
        {colecao.descricao && <p className="mt-4 max-w-xl text-creme/80">{colecao.descricao}</p>}
      </div>
    </section>
  )
}
