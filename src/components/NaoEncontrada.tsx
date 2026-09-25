import Link from 'next/link'

import GradeObras from './GradeObras'
import { getPecas } from '../lib/dados/consultas'

/**
 * ENDEREÇO QUE NÃO EXISTE.
 * ========================
 *
 * Na página única, qualquer endereço abria a landing: link colado em conversa
 * chega torto com frequência. Com páginas de verdade isso deixou de servir,
 * porque abrir o início no lugar de uma peça que a pessoa esperava ver é
 * pior que dizer que ela não está ali. Então a página diz, sem drama, e já
 * oferece as portas: o acervo e algumas peças.
 *
 * O `noindex` e o status 404 vêm do próprio Next (ver src/app/not-found.tsx).
 */
export default async function NaoEncontrada() {
  const destaques = (await getPecas()).filter((p) => p.destaque).slice(0, 4)

  return (
    <>
      <section className="bg-branco">
        <div className="container-site secao-g">
          <span className="eyebrow block">Endereço não encontrado</span>
          <h1 className="mt-4 texto-display">Esta página não existe</h1>
          <span className="filete mt-8" />
          <p className="t-italico mt-8 max-w-[30ch]">
            Pode ser um link que chegou cortado, ou uma peça que mudou de lugar.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/acervo" className="btn-primario">
              Ver o acervo
            </Link>
            <Link href="/" className="btn-contorno">
              Ir para o início
            </Link>
          </div>

          <GradeObras pecas={destaques} className="mt-20" />
        </div>
      </section>
    </>
  )
}
