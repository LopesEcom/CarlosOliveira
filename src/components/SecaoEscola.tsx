import Link from 'next/link'

import Revelar from './Revelar'

/**
 * Bloco 7 do início, A ESCOLA.
 * ============================
 *
 * Só o anúncio e a porta para a página /escola. A escola ainda não tem
 * local, datas nem valores (Etapa 7), então o bloco não promete nada além
 * do que o Carlos já disse: que vai abrir, e que quer ensinar o que sabe.
 */
export default function SecaoEscola() {
  return (
    <section className="border-t border-borda-sutil bg-branco">
      <div className="container-site secao-g">
        <div className="u-grid items-end">
          <div className="col-6">
            <Revelar>
              <span className="eyebrow block">Em preparação</span>
              <h2 className="mt-4 texto-display-sm">A escola de entalhadores</h2>
              <span className="filete mt-7" />
              <p className="t-italico mt-8 max-w-[26ch]">
                O que o formão ensinou a ele, ele quer ensinar a quem chegar.
              </p>
            </Revelar>
          </div>

          <div className="col-4 deslocar-8">
            <Revelar atraso={120}>
              <p className="text-tinta/75">
                O Carlos vai abrir uma escola para ensinar o entalhe do jeito que ele
                aprendeu. As inscrições ainda não abriram, mas você pode deixar seu nome
                que ele te avisa.
              </p>
              <Link href="/escola" className="btn-contorno mt-8">
                Conhecer a escola
              </Link>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  )
}
