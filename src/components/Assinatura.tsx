import Image from 'next/image'

import { brand } from '../lib/brand'
import { cn } from '../lib/utils'

interface AssinaturaProps {
  /** Sobre foto ou fundo escuro: vale a versão em contraste, creme. */
  clara?: boolean
  /** `linha` para o cabeçalho; `bloco` para o rodapé, maior. */
  forma?: 'linha' | 'bloco'
  className?: string
}

const COLORIDA = '/marca/logo.png'
// Nome diferente do creme do selo antigo (logo-creme.png): o otimizador de
// imagens guarda pelo endereço por até 30 dias, e o nome repetido servia a
// logo velha.
const CREME = '/marca/logo-contraste.png'

/**
 * A LOGO DO CARLOS.
 * =================
 *
 * O brasão Artepira que o genro dele fez: oval, com os formões, "Artepira" e
 * "Carlos Escultor". Pedido do Carlos, no lugar do selo de anéis de antes
 * (que ficou em marca/antigo/). Os arquivos saem de `marca/original/` pelo
 * `scripts/marca.mjs`, em duas versões: a colorida, para o branco, e uma em
 * contraste, creme numa cor só, para a foto da capa e o rodapé (sobre a
 * nogueira, o oval marrom da colorida sumia no fundo).
 *
 * No cabeçalho as duas ficam empilhadas e trocam por opacidade: sobre a capa
 * vale a creme, e ao rolar, quando o cabeçalho ganha fundo branco, a
 * colorida aparece no mesmo compasso do fundo, sem piscar.
 *
 * `width` e `height` são o tamanho em que ela aparece, e não o do arquivo:
 * é por eles que o next/image escolhe a largura servida (1x e 2x). O
 * arquivo tem 382 × 290; o cabeçalho usa 64 px de altura (128 no 2x), e o
 * rodapé fica abaixo da largura do arquivo para não borrar.
 *
 * O texto alternativo diz o nome uma vez, e só na versão visível.
 */
export default function Assinatura({ clara = false, forma = 'linha', className }: AssinaturaProps) {
  const alt = `${brand.nome}, Artepira`

  if (forma === 'bloco') {
    return (
      <Image
        src={clara ? CREME : COLORIDA}
        alt={alt}
        width={190}
        height={144}
        className={cn('h-auto w-[10rem] md:w-[11.875rem]', className)}
      />
    )
  }

  const classe = 'h-14 w-auto transition-opacity duration-500 ease-suave md:h-16'

  return (
    <span className={cn('relative block', className)}>
      <Image src={COLORIDA} alt={clara ? '' : alt} width={84} height={64} priority className={cn(classe, clara && 'opacity-0')} />
      <Image
        src={CREME}
        alt={clara ? alt : ''}
        width={84}
        height={64}
        priority
        className={cn(classe, 'absolute inset-0', !clara && 'opacity-0')}
      />
    </span>
  )
}
