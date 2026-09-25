import Link from 'next/link'

import CabecalhoPagina from '../../../components/CabecalhoPagina'
import Revelar from '../../../components/Revelar'
import SecaoBancada from '../../../components/SecaoBancada'
import SecaoOficina from '../../../components/SecaoOficina'
import SecaoTrajetoria from '../../../components/SecaoTrajetoria'
import { FRASE_DA_CASA, falas } from '../../../data/bancada'
import { brand } from '../../../lib/brand'

export const metadata = { title: 'História', description: 'Da Pavuna ao Bixiga, onde virou Mestre Entalhador aos 21 anos: a trajetória de Carlos Oliveira, escultor entalhador com mais de 300 peças em madeira maciça.', alternates: { canonical: '/historia' } }

/**
 * A HISTÓRIA DO CARLOS.
 * =====================
 *
 * Tudo aqui sai da introdução do livro dele e do que ele contou (ver
 * "Quem é o Carlos" no README). Nada de ano inventado: a trajetória vai em
 * ordem, sem datas, até ele confirmar.
 *
 *   1  Abertura     o título e a foto dele com as peças
 *   2  Oficina      o vídeo, os números e o prêmio (a mesma do início)
 *   3  Caminho      as seis paradas
 *   4  Nas palavras dele   as falas do livro, em corpo grande
 *   5  Bancada      os vídeos curtos
 *   6  Livro        a porta para a autobiografia
 */
export default function Historia() {
  return (
    <>

      <CabecalhoPagina
        rotulo="A história"
        titulo="Uma vida na bancada"
        italico="Transformar o bruto em belo."
        foto={{
          // Uma das duas fotos do Carlos no site; a outra é a capa do livro.
          src: '/atelier/Foto-Carlos.jpeg',
          alt: 'Carlos Oliveira, de jaqueta verde, sorrindo.',
        }}
      >
        <p>
          O Carlos é o caçula de um tupieiro. Nasceu na Pavuna, cresceu em Além
          Paraíba, aprendeu o ofício em Petrópolis e virou Mestre Entalhador no
          Bixiga aos 21 anos. Aqui vai um pouco dessa história, contada por ele no
          livro.
        </p>
      </CabecalhoPagina>

      <SecaoOficina />
      <SecaoTrajetoria />

      {/* As falas do livro, uma por vez, em corpo grande: é a voz dele, e
          não um resumo nosso. */}
      <section className="bg-tinta text-creme">
        <div className="container-site secao-g">
          <Revelar>
            <span className="eyebrow block text-center text-creme rebaixado">Nas palavras dele</span>
          </Revelar>
          <div className="mx-auto mt-12 grid max-w-4xl gap-16 md:gap-20">
            {falas.map((fala) => (
              <Revelar key={fala} como="figure" atraso={80}>
                <span className="filete-claro" />
                <blockquote className="t-italico-g mt-7 text-creme">“{fala}”</blockquote>
                <figcaption className="mt-6 rotulo text-creme rebaixado">
                  {brand.nome}, na introdução de {brand.livro.titulo}
                </figcaption>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      <SecaoBancada />

      <section className="border-t border-borda-sutil bg-branco">
        <div className="container-site secao-g flex flex-col items-center text-center">
          <Revelar>
            <p className="t-italico-g mx-auto max-w-[22ch]">{FRASE_DA_CASA}</p>
            <p className="mx-auto mt-8 max-w-md text-tinta/70">
              A história completa está no livro, {brand.livro.titulo}, que ainda traz, no fim, um manual de entalhe.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/livro" className="btn-primario">
                Conhecer o livro
              </Link>
              <Link href="/acervo" className="btn-contorno">
                Ver as peças
              </Link>
            </div>
          </Revelar>
        </div>
      </section>
    </>
  )
}
