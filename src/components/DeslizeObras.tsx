'use client'

import Image from 'next/image'
import Link from 'next/link'

import { useDeslizeHorizontal, useMovimentoReduzido, useTelaLarga } from '../lib/movimento'
import { caminhoPeca } from '../lib/rotas'
import { rotulosTema, type Peca } from '../lib/tipos'

interface DeslizeObrasProps {
  obras: Peca[]
}

/**
 * Quanto o conteúdo anda para cada pixel rolado. Menor que 1: o trilho anda
 * mais rápido que o dedo. No celular cada peça ocupa a tela inteira e precisa
 * de mais rolagem para durar uma dedada.
 */
const RITMO_LARGO = 0.62
const RITMO_ESTREITO = 0.8

/** Quantas peças atravessam a tela. Poucas: o acervo inteiro vem logo abaixo. */
const NO_DESLIZE = 4

/**
 * Bloco 3, AS PEÇAS DESLIZANDO.
 * =============================
 *
 * A seção prende na tela e as peças atravessam de lado enquanto a pessoa rola
 * normalmente. Numa grade, as peças são itens de lista e o olho varre a
 * página; aqui cada uma ocupa dois terços da tela sozinha, uma de cada vez.
 *
 * São só quatro, e quase sem texto: um título na abertura, o nome em cada
 * peça e o botão no fim. As falas do Carlos que moravam entre as peças
 * ficaram na página da história, onde há espaço para lê-las.
 *
 * Com `prefers-reduced-motion` a seção não monta: rolagem presa é o movimento
 * mais forte da página, e quem pede menos movimento costuma pedir por enjoo.
 * A vitrine logo abaixo mostra as mesmas peças.
 */
export default function DeslizeObras({ obras }: DeslizeObrasProps) {
  const estreita = !useTelaLarga()
  const { externo, trilho } = useDeslizeHorizontal<HTMLElement, HTMLDivElement>(
    true,
    estreita ? RITMO_ESTREITO : RITMO_LARGO,
  )
  const semMovimento = useMovimentoReduzido()

  if (semMovimento) return null

  return (
    <section ref={externo} className="deslize" aria-label="Peças em destaque">
      <div className="deslize_janela">
        <div ref={trilho} className="deslize_trilho">
          <div className="deslize_painel deslize_painel--cheio">
            <div className="deslize_abertura container-site">
              <span className="eyebrow block text-creme rebaixado">Da bancada</span>
              <h2 className="mt-5 max-w-[16ch] texto-display text-creme">
                Um pouco do que tem na oficina
              </h2>
            </div>
          </div>

          {obras.slice(0, NO_DESLIZE).map((obra, indice) => (
            <div key={obra.id} className="deslize_painel deslize_painel--peca">
              {/* Leva à página da peça, onde estão as outras fotos, o zoom e a
                  ficha. O visor em tela cheia mora lá. */}
              <Link href={caminhoPeca(obra)} className="deslize_cartao" aria-label={`${obra.nome}: ver a peça`}>
                {obra.imagens[0] && (
                  <Image
                    src={obra.imagens[0]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 52vh, 100vw"
                    loading={indice < 2 ? 'eager' : 'lazy'}
                  />
                )}
                <span className="deslize_legenda">
                  <span className="block rotulo text-creme rebaixado">{rotulosTema[obra.tema]}</span>
                  <span className="mt-1 block font-display text-h4 text-creme">{obra.nome}</span>
                </span>
              </Link>
            </div>
          ))}

          <div className="deslize_painel deslize_painel--cheio">
            <div className="container-site flex justify-center">
              <Link href="/acervo" className="btn-contorno-claro">
                Ver o acervo inteiro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
