import Image from 'next/image'

import { brand } from '../lib/brand'
import { cn } from '../lib/utils'

/**
 * A capa do livro, a que o Carlos fez.
 * ====================================
 *
 * O arquivo mora em `public/livro/capa.jpeg` (832 × 1251, quase 2:3). A
 * sombra por baixo é a de um exemplar deitado na mesa: sobre o bloco escuro
 * da seção, sem ela a capa, também escura, se dissolvia no fundo.
 */
export default function CapaLivro({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-[832/1251] w-full shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]', className)}>
      <Image
        src="/livro/capa.jpeg"
        alt={`Capa do livro ${brand.livro.completo}, de ${brand.nome}.`}
        fill
        sizes="(min-width: 1024px) 24rem, 20rem"
        className="object-cover"
      />
    </div>
  )
}
