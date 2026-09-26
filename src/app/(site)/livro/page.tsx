import Link from 'next/link'

import Revelar from '../../../components/Revelar'
import SecaoLivro from '../../../components/SecaoLivro'
import { brand } from '../../../lib/brand'

export const metadata = { title: brand.livro.titulo, description: `${brand.livro.completo}: o método de entalhe clássico de ${brand.nome}, com 58 anos de profissão. Tiragem livre e gratuita.`, alternates: { canonical: '/livro' } }

/**
 * A APOSTILA, EM PÁGINA PRÓPRIA.
 * ==============================
 *
 * A seção do início, agora como abertura da página (o título vira o h1). O
 * endereço continua /livro, o mesmo do menu e dos links já espalhados.
 *
 * O fim da página leva à escola: quem se interessou pelo método é
 * exatamente quem pode querer aprender na bancada.
 */
export default function Livro() {
  return (
    <>

      <SecaoLivro comoPagina />

      <section className="bg-branco">
        <div className="container-site secao-g">
          <div className="u-grid items-end">
            <div className="col-6">
              <Revelar>
                <span className="eyebrow block">Da apostila para a bancada</span>
                <h2 className="mt-4 texto-display-sm">Quer aprender com ele?</h2>
                <span className="filete mt-7" />
              </Revelar>
            </div>
            <div className="col-4 deslocar-8">
              <Revelar atraso={120}>
                <p className="text-tinta/75">
                  A apostila ensina o caminho. A escola de entalhadores, que o
                  Carlos vai abrir, vai ensinar com a mão dele ao lado.
                </p>
                <Link href="/escola" className="btn-contorno mt-8">
                  Conhecer a escola
                </Link>
              </Revelar>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
