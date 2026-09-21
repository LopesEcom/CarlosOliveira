import { brand } from '../lib/brand'
import { cn } from '../lib/utils'

interface AssinaturaProps {
  /** Sobre foto ou fundo escuro. */
  clara?: boolean
  /** `linha` para o alto da capa; `bloco` para o rodapé, centralizada. */
  forma?: 'linha' | 'bloco'
  className?: string
}

/**
 * A ASSINATURA, no lugar de uma logo que ainda não existe.
 * =========================================================
 *
 * O Carlos não tem marca desenhada, e inventar um símbolo aqui seria decidir
 * por ele o que vai para cartão, etiqueta e placa. Então a assinatura é só o
 * nome, mas composto como marca e não como texto solto:
 *
 *   SELO     as iniciais em itálico dentro de um quadrado de filete. O
 *            itálico da Fraunces tem o traço inclinado de goiva; o quadrado
 *            é o bloco de madeira de onde a letra sai.
 *   NOME     caixa alta com entreletra larga, o peso de placa gravada.
 *   OFÍCIO   em corpo pequeno, entre dois filetes curtos, como a linha de
 *            baixo de um carimbo.
 *
 * Quando a logo chegar, é este componente que troca, e o resto do site não
 * percebe.
 */
export default function Assinatura({ clara = false, forma = 'linha', className }: AssinaturaProps) {
  const cor = clara ? 'text-creme' : 'text-tinta'
  const borda = clara ? 'border-creme/60' : 'border-tinta/60'
  const filete = clara ? 'bg-creme/50' : 'bg-tinta/40'

  const [primeiro, ...resto] = brand.nome.split(' ')
  const iniciais = `${primeiro[0]}${resto.at(-1)?.[0] ?? ''}`

  if (forma === 'bloco') {
    return (
      <div className={cn('flex flex-col items-center text-center', cor, className)}>
        <Selo iniciais={iniciais} borda={borda} grande />
        <p className="mt-7 font-display text-h3 font-light uppercase leading-none tracking-largo-lg">
          {brand.nome}
        </p>
        <Oficio filete={filete} className="mt-4" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-4', cor, className)}>
      <Selo iniciais={iniciais} borda={borda} />
      <div className="min-w-0 leading-none">
        <p className="truncate font-display text-h5 font-normal uppercase tracking-largo-lg">
          {brand.nome}
        </p>
        <Oficio filete={filete} className="mt-2" alinhado />
      </div>
    </div>
  )
}

function Selo({ iniciais, borda, grande = false }: { iniciais: string; borda: string; grande?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center border font-display font-light italic leading-none',
        borda,
        grande ? 'size-16 text-[1.9rem]' : 'size-11 text-[1.3rem]',
      )}
    >
      {iniciais}
    </span>
  )
}

function Oficio({ filete, className, alinhado = false }: { filete: string; className?: string; alinhado?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2.5', !alinhado && 'justify-center', className)}>
      {!alinhado && <span aria-hidden className={cn('h-px w-6', filete)} />}
      <span className="font-display text-[0.625rem] uppercase tracking-largo-lg rebaixado">
        Escultor · Entalhador
      </span>
      <span aria-hidden className={cn('h-px w-6', filete)} />
    </span>
  )
}
