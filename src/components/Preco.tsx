import { precoBRL, textoPreco } from '../lib/formato'
import type { Peca } from '../lib/tipos'
import { cn } from '../lib/utils'

interface PrecoProps {
  peca: Pick<Peca, 'preco' | 'precoOriginal' | 'aPartirDe'>
  tamanho?: 'padrao' | 'grande'
  /** Mostra "Valor sob consulta" quando não há preço. No cartão, o silêncio basta. */
  mostrarConsulta?: boolean
  className?: string
}

/**
 * O preço como a Lennys mostra: o valor na serifa e, em promoção, o valor
 * antigo riscado ao lado. Sem valor, a peça é "sob consulta", e é isso que
 * se diz (ou nada, no cartão da grade, onde a linha a mais só pesaria).
 */
export default function Preco({ peca, tamanho = 'padrao', mostrarConsulta = false, className }: PrecoProps) {
  const texto = textoPreco(peca)

  if (!texto) {
    return mostrarConsulta ? <p className={cn('rotulo text-cinza', className)}>Valor sob consulta</p> : null
  }

  const emPromocao = peca.precoOriginal !== null && peca.preco !== null && peca.precoOriginal > peca.preco

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2.5', className)}>
      <span className={cn('font-display', tamanho === 'grande' ? 'text-h3' : 'text-h5')}>{texto}</span>
      {emPromocao && (
        <s className={cn('text-cinza', tamanho === 'grande' ? 'text-base' : 'text-sm')}>
          <span className="sr-only">de </span>
          {precoBRL(peca.precoOriginal as number)}
        </s>
      )}
    </p>
  )
}
