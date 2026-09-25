import Image from 'next/image'
import type { ReactNode } from 'react'

import { cn } from '../lib/utils'
import Revelar from './Revelar'

interface CabecalhoPaginaProps {
  /** O rótulo pequeno de cima: em que parte do site a pessoa está. */
  rotulo: string
  titulo: ReactNode
  /** A frase em itálico, a voz da casa. Uma só. */
  italico?: ReactNode
  children?: ReactNode
  /** Foto à direita no computador; no celular desce para baixo do texto. */
  foto?: { src: string; alt: string }
  className?: string
}

/**
 * A ABERTURA DAS PÁGINAS DE DENTRO.
 * =================================
 *
 * O início tem a capa com o nome colossal; as outras páginas abrem com a
 * mesma gramática em corpo menor: rótulo, título em caixa alta, filete e a
 * frase em itálico. É o que faz o acervo, a história e a escola parecerem
 * capítulos do mesmo livro, e não páginas de sistemas diferentes.
 */
export default function CabecalhoPagina({
  rotulo,
  titulo,
  italico,
  children,
  foto,
  className,
}: CabecalhoPaginaProps) {
  return (
    <section className={cn('bg-branco', className)}>
      <div className="container-site pb-12 pt-12 md:pb-20 md:pt-20">
        <div className="u-grid items-end">
          <div className={foto ? 'col-7' : 'col-8'}>
            <Revelar>
              <span className="eyebrow block">{rotulo}</span>
              <h1 className="mt-4 texto-display">{titulo}</h1>
              <span className="filete mt-8" />
            </Revelar>
            {(italico || children) && (
              <Revelar atraso={120}>
                {italico && <p className="t-italico mt-8 max-w-[28ch]">{italico}</p>}
                {children && <div className="mt-6 max-w-xl space-y-4 text-tinta/75">{children}</div>}
              </Revelar>
            )}
          </div>

          {foto && (
            <div className="col-4 deslocar-8 mt-6 md:mt-0">
              <Revelar distancia="nenhuma" atraso={160}>
                <div className="relative aspect-[3/4] w-full bg-borda-sutil">
                  <Image src={foto.src} alt={foto.alt} fill priority sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
              </Revelar>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
