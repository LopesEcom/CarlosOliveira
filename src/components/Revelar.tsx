'use client'

import { Fragment, type CSSProperties, type ElementType, type ReactNode } from 'react'

import { useRevelar } from '../lib/movimento'
import { cn } from '../lib/utils'

interface RevelarProps {
  children: ReactNode
  /**
   * Atraso em milissegundos. É o que faz o escalonamento: numa lista, passe
   * `indice * 90` e os itens chegam em cascata em vez de em bloco.
   *
   * Cuidado com o total. Acima de uns 600 ms de atraso a pessoa já leu o
   * bloco e está esperando ele aparecer, o que é o oposto do efeito.
   */
  atraso?: number
  /**
   * Distância percorrida na entrada. `nenhuma` só esmaece, e é o certo para
   * imagem grande: foto que sobe empurra o layout na percepção.
   */
  distancia?: 'curta' | 'padrao' | 'nenhuma'
  /**
   * Para o que já está na PRIMEIRA TELA.
   *
   * O gatilho normal dispara 10% antes da borda de baixo, o que faz o
   * conteúdo chegar no ritmo de quem rola. Para um elemento encostado no
   * rodapé da abertura isso vira defeito: ele nasce logo abaixo da linha de
   * disparo e fica invisível até a pessoa rolar, mesmo estando na tela.
   *
   * Foi o que aconteceu com a palavra colossal da capa, que é justamente a
   * âncora da folha. Com isto ligado, basta o elemento tocar a tela.
   */
  naPrimeiraTela?: boolean
  /** Elemento renderizado. `div` por padrão; use `li`, `figure`, `section`. */
  como?: ElementType
  className?: string
}

const DISTANCIAS: Record<NonNullable<RevelarProps['distancia']>, string> = {
  curta: '0.75rem',
  padrao: '1.75rem',
  nenhuma: '0rem',
}

/**
 * Revela o conteúdo quando ele chega à tela.
 *
 * Envolver em vez de aplicar direto no elemento é de propósito: assim o
 * elemento de dentro fica livre para usar `transform` (o `group-hover:scale`
 * dos cards, por exemplo) sem que as duas transformações briguem.
 *
 * Sem JavaScript, com `prefers-reduced-motion` ou em navegador sem
 * `IntersectionObserver`, nasce revelado, ver lib/movimento.ts.
 */
export default function Revelar({
  children,
  atraso = 0,
  distancia = 'padrao',
  naPrimeiraTela = false,
  como: Como = 'div',
  className,
}: RevelarProps) {
  const { alvo, visivel } = useRevelar<HTMLElement>(
    naPrimeiraTela ? { margem: '0px' } : undefined,
  )

  return (
    <Como
      ref={alvo}
      className={cn('revelar', visivel && 'revelar-visivel', className)}
      style={
        {
          '--revelar-atraso': `${atraso}ms`,
          '--revelar-distancia': DISTANCIAS[distancia],
        } as CSSProperties
      }
    >
      {children}
    </Como>
  )
}

interface FraseReveladaProps {
  /** O texto puro. Ele é dividido em palavras aqui dentro. */
  texto: string
  /** Milissegundos entre uma palavra e a seguinte. */
  passo?: number
  className?: string
  como?: ElementType
}

/**
 * A mesma revelação, mas palavra por palavra.
 *
 * Reservada para UMA frase por peça, a frase da marca. Aplicada em texto
 * corrido vira efeito de apresentação de slides barata, e o segundo uso já
 * destrói o efeito do primeiro.
 *
 * Acessibilidade: as palavras continuam sendo texto, separadas por espaços de
 * verdade, dentro de um único elemento. Leitor de tela lê a frase inteira e
 * seguida, o que não aconteceria com uma `<span>` por letra.
 */
export function FraseRevelada({
  texto,
  passo = 55,
  className,
  como: Como = 'p',
}: FraseReveladaProps) {
  const { alvo, visivel } = useRevelar<HTMLElement>()
  const palavras = texto.split(' ')

  return (
    <Como ref={alvo} className={className}>
      {palavras.map((palavra, indice) => (
        // A palavra se repete numa frase; o índice é o que a distingue.
        <Fragment key={`${palavra}-${indice}`}>
          <span
            className={cn('revelar inline-block', visivel && 'revelar-visivel')}
            style={
              {
                '--revelar-atraso': `${indice * passo}ms`,
                '--revelar-distancia': '0.5em',
              } as CSSProperties
            }
          >
            {palavra}
          </span>
          {/*
            O espaço fica FORA da span de propósito. Espaço no fim de um
            `inline-block` é descartado na renderização, e a frase sairia com
            as palavras todas coladas.
          */}
          {indice < palavras.length - 1 && ' '}
        </Fragment>
      ))}
    </Como>
  )
}
