import Image from 'next/image'

import { brand } from '../lib/brand'
import { cn } from '../lib/utils'

/**
 * A capa da apostila Arte Pira.
 * =============================
 *
 * O arquivo mora em `public/livro/arte-pira.webp` (852 × 849, quase
 * quadrado), tirado da primeira página do material. Papel claro com filete
 * dourado: sobre o bloco escuro da seção ele já se destaca sozinho, e a
 * sombra só dá o peso de uma folha pousada na mesa.
 */
export default function CapaLivro({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-[852/849] w-full shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]', className)}>
      <Image
        src="/livro/arte-pira.webp"
        alt={`Capa da apostila ${brand.livro.completo}: Escola Oficina Arte Pira, Além Paraíba, Minas Gerais.`}
        fill
        sizes="(min-width: 1024px) 28rem, 24rem"
        className="object-cover"
      />
    </div>
  )
}
