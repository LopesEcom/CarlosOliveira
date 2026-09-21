import { FRASE_DA_CASA, falas } from '../data/bancada'
import { rotulosCategoria, type Obra } from '../data/obras'
import { brand } from '../lib/brand'
import { useDeslizeHorizontal, useTelaLarga } from '../lib/movimento'

interface DeslizeObrasProps {
  obras: Obra[]
  /** Abre a peça no visor, o mesmo do acervo. */
  aoAbrir: (obra: Obra) => void
}

/**
 * Quanto o conteúdo anda para cada pixel rolado. Menor que 1: o trilho anda
 * mais rápido que o dedo. No celular cada peça ocupa a tela inteira e precisa
 * de mais rolagem para durar uma dedada.
 */
const RITMO_LARGO = 0.62
const RITMO_ESTREITO = 0.8

/** Depois de quantas peças entra uma fala do Carlos. */
const FALA_A_CADA = 2

/**
 * Bloco 3, AS PEÇAS DESLIZANDO.
 * =============================
 *
 * A seção prende na tela e as peças atravessam de lado enquanto a pessoa rola
 * normalmente. Numa grade, as peças são itens de lista e o olho varre a
 * página; aqui cada uma ocupa dois terços da tela sozinha, uma de cada vez.
 *
 * Entre elas, a voz do Carlos: uma fala a cada duas peças. A sequência vira
 * foto, foto, frase — o ritmo de quem mostra a oficina, e não de quem mostra
 * um catálogo. O catálogo completo vem logo depois, na grade.
 *
 * Com `prefers-reduced-motion` a seção não monta: rolagem presa é o movimento
 * mais forte da página, e quem pede menos movimento costuma pedir por enjoo.
 * O acervo logo abaixo mostra as mesmas peças.
 */
export default function DeslizeObras({ obras, aoAbrir }: DeslizeObrasProps) {
  const estreita = !useTelaLarga()
  const { externo, trilho } = useDeslizeHorizontal<HTMLElement, HTMLDivElement>(
    true,
    estreita ? RITMO_ESTREITO : RITMO_LARGO,
  )

  let proximaFala = 0

  return (
    <section ref={externo} className="deslize" aria-label="Peças em destaque">
      <div className="deslize_janela">
        <div ref={trilho} className="deslize_trilho">
          <div className="deslize_painel deslize_painel--cheio">
            <div className="deslize_abertura container-site">
              <div className="u-grid items-end">
                <div className="col-7">
                  <span className="eyebrow block text-creme rebaixado">Da bancada</span>
                  <h2 className="mt-5 texto-display uppercase text-creme">
                    Um pouco do que está na oficina
                  </h2>
                </div>
                <div className="col-4 deslocar-8">
                  <span className="filete-claro" />
                  <p className="t-italico mt-7 max-w-[30ch] text-creme">
                    São mais de trezentas. Estas são algumas, e todas estão prontas.
                  </p>
                  <p className="mt-6 font-display text-h6 uppercase tracking-largo text-creme rebaixado">
                    Role para ver →
                  </p>
                </div>
              </div>
            </div>
          </div>

          {obras.map((obra, indice) => {
            const entraFala =
              (indice + 1) % FALA_A_CADA === 0 &&
              indice < obras.length - 1 &&
              proximaFala < falas.length
            const fala = entraFala ? falas[proximaFala++] : null

            return (
              <PecaEFala
                key={obra.slug}
                obra={obra}
                fala={fala}
                adiantada={indice < 2}
                aoAbrir={aoAbrir}
              />
            )
          })}

          <div className="deslize_painel deslize_painel--cheio">
            <figure className="container-site flex flex-col items-center text-center">
              <span className="filete-claro" />
              <blockquote className="t-italico-g mt-9 max-w-[22ch] text-creme">
                {FRASE_DA_CASA}
              </blockquote>
              <figcaption className="mt-9 font-display text-h6 uppercase tracking-largo text-creme rebaixado">
                {brand.nome}
              </figcaption>
              <a href="#acervo" className="btn-contorno-claro btn-sm mt-12">
                Ver o acervo inteiro
              </a>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}

function PecaEFala({
  obra,
  fala,
  adiantada,
  aoAbrir,
}: {
  obra: Obra
  fala: string | null
  adiantada: boolean
  aoAbrir: (obra: Obra) => void
}) {
  return (
    <>
      <div className="deslize_painel deslize_painel--peca">
        <button
          type="button"
          onClick={() => aoAbrir(obra)}
          className="deslize_cartao"
          aria-label={`Ver ${obra.nome} de perto`}
        >
          <img
            src={obra.imagens[0]}
            alt=""
            loading={adiantada ? 'eager' : 'lazy'}
            decoding="async"
          />
          <span className="deslize_legenda">
            <span className="block font-display text-[0.6875rem] uppercase tracking-largo-lg text-creme rebaixado">
              {rotulosCategoria[obra.categoria]}
            </span>
            <span className="mt-1 block font-display text-h4 uppercase tracking-largo text-creme">
              {obra.nome}
            </span>
          </span>
        </button>
      </div>

      {fala && (
        <div className="deslize_painel deslize_painel--fala">
          <figure>
            <span className="filete-claro" />
            <blockquote className="t-italico-g mt-7 text-creme">“{fala}”</blockquote>
            <figcaption className="mt-7 font-display text-h6 uppercase tracking-largo text-creme rebaixado">
              {brand.nome}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
