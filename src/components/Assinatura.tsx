import Image from 'next/image'

import { brand } from '../lib/brand'
import { cn } from '../lib/utils'

interface AssinaturaProps {
  /** Sobre foto ou fundo escuro. */
  clara?: boolean
  /** `linha` para o cabeçalho; `bloco` para o rodapé, maior e centralizada. */
  forma?: 'linha' | 'bloco'
  className?: string
}

/** Proporção da logo horizontal (símbolo, nome e ofício), largura/altura. */
const PROPORCAO = 1200 / 294

/**
 * A LOGO DO CARLOS.
 * =================
 *
 * O selo de anéis com o CO, o nome e "Escultor · Entalhador", na versão
 * horizontal. Os arquivos saem de `marca/original/` pelo `scripts/marca.mjs`,
 * sem o fundo branco e pintados nas duas cores do site.
 *
 * No cabeçalho as duas cores ficam empilhadas e trocam por opacidade: sobre
 * a capa vale a creme, e ao rolar, quando o cabeçalho ganha fundo branco, a
 * marrom aparece no mesmo compasso do fundo, sem piscar.
 *
 * O nome já está na imagem; o texto alternativo diz o nome uma vez, e só na
 * versão visível.
 */
export default function Assinatura({ clara = false, forma = 'linha', className }: AssinaturaProps) {
  if (forma === 'bloco') {
    return (
      <Image
        src={clara ? '/marca/logo-creme.png' : '/marca/logo-tinta.png'}
        alt={brand.nome}
        width={1200}
        height={294}
        sizes="20rem"
        className={cn('h-auto w-[17rem] md:w-[20rem]', className)}
      />
    )
  }

  const classe = 'h-11 w-auto transition-opacity duration-500 ease-suave md:h-12'
  const estilo = { aspectRatio: PROPORCAO }

  return (
    <span className={cn('relative block', className)}>
      <Image
        src="/marca/logo-tinta.png"
        alt={clara ? '' : brand.nome}
        width={1200}
        height={294}
        priority
        sizes="12rem"
        style={estilo}
        className={cn(classe, clara && 'opacity-0')}
      />
      <Image
        src="/marca/logo-creme.png"
        alt={clara ? brand.nome : ''}
        width={1200}
        height={294}
        priority
        sizes="12rem"
        style={estilo}
        className={cn(classe, 'absolute inset-0', !clara && 'opacity-0')}
      />
    </span>
  )
}
