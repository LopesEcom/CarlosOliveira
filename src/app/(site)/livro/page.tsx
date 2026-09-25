import Link from 'next/link'

import Revelar from '../../../components/Revelar'
import SecaoLivro from '../../../components/SecaoLivro'
import { brand } from '../../../lib/brand'

export const metadata = { title: brand.livro.titulo, description: `${brand.livro.completo}: a autobiografia de ${brand.nome}, escultor entalhador, com um manual de entalhes no fim.`, alternates: { canonical: '/livro' } }

/**
 * O LIVRO, EM PÁGINA PRÓPRIA.
 * ===========================
 *
 * A seção do início, agora como abertura da página (o título vira o h1). Por
 * enquanto é o que se sabe do livro; quando chegarem a foto da capa e o
 * sumário real do manual, é a SecaoLivro que troca, e as duas páginas
 * acompanham.
 *
 * O fim da página leva à escola: quem se interessou por um manual de
 * entalhes é exatamente quem pode querer aprender na bancada.
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
                <span className="eyebrow block">Do livro para a bancada</span>
                <h2 className="mt-4 texto-display-sm">Quer aprender com ele?</h2>
                <span className="filete mt-7" />
              </Revelar>
            </div>
            <div className="col-4 deslocar-8">
              <Revelar atraso={120}>
                <p className="text-tinta/75">
                  O manual do livro ensina o caminho. A escola de entalhadores,
                  que o Carlos vai abrir, vai ensinar com a mão dele ao lado.
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
