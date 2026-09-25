import Link from 'next/link'

import { brand } from '../lib/brand'
import BotaoWhatsapp from './BotaoWhatsapp'
import CapaLivro from './CapaLivro'
import Revelar from './Revelar'

/**
 * O que o manual de entalhes cobre.
 *
 * TODO: descreve o caminho que qualquer manual de entalhe percorre, não
 * necessariamente os capítulos do livro do Carlos. Quando chegar o sumário,
 * troque por títulos de capítulo de verdade.
 */
const MANUAL = [
  { titulo: 'A ferramenta', texto: 'Quais formões e goivas usar, para que serve cada perfil e como manter o fio.' },
  { titulo: 'A madeira', texto: 'Como ler o veio e por que o mesmo corte abre limpo num sentido e lasca no outro.' },
  { titulo: 'Os cortes', texto: 'Do desbaste ao detalhe, tirando pouco de cada vez.' },
  { titulo: 'O acabamento', texto: 'Lixa, correção e o que passar no fim para o veio aparecer.' },
]

/**
 * Bloco 6, O LIVRO.
 * =================
 *
 * O bloco invertido da página, o pico de contraste, porque o livro é o que o
 * Carlos tem de mais raro: um escultor que escreveu por que o entalhe o curou
 * e, no fim, ensinou como se faz.
 *
 * A capa é a que o Carlos fez (ver CapaLivro).
 *
 * A mesma seção é o início e a página /livro. Na página ela abre o
 * documento, e o título vira o h1; no início ela leva à página.
 */
export default function SecaoLivro({ comoPagina = false }: { comoPagina?: boolean }) {
  const Titulo = comoPagina ? 'h1' : 'h2'

  return (
    <section className="bg-tinta text-creme">
      <div className="container-site secao-g">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
          <Revelar distancia="nenhuma">
            <CapaLivro className="mx-auto max-w-xs lg:max-w-sm" />
          </Revelar>

          <div>
            <Revelar atraso={80}>
              <span className="eyebrow block text-creme rebaixado">O livro</span>
              <Titulo className="mt-4 texto-display text-creme">{brand.livro.titulo}</Titulo>
              <p className="t-italico mt-3 text-creme">{brand.livro.subtitulo}</p>
              <span className="filete-claro mt-8" />
            </Revelar>

            <Revelar atraso={160}>
              <div className="mt-8 max-w-xl space-y-5 text-creme/75">
                <p>
                  No livro, o Carlos conta a própria vida: o caçula que nasceu na Pavuna,
                  herdou do pai tupieiro um talento que parecia impossível, chorou de
                  saudade numa calçada de Petrópolis e virou Mestre Entalhador no Bixiga
                  aos 21 anos. Conta das estradas num velho Gordini, das feiras de Niterói
                  e da Marina, a companheira que ficou do lado dele numa batalha
                  silenciosa, que o formão ajudou a vencer.
                </p>
                <p>
                  E, no fim, ele ensina: um manual de entalhe, passo a passo, para você
                  aprender também.
                </p>
              </div>
            </Revelar>

            {/* O convite com que ele abre o livro, nas palavras dele. */}
            <Revelar atraso={220}>
              <figure className="mt-10 border-l border-creme/40 pl-6">
                <blockquote className="t-italico text-creme">
                  “Convido você a puxar uma cadeira no meu ateliê, respirar o
                  cheiro da serragem e viajar comigo por estes capítulos.”
                </blockquote>
                <figcaption className="mt-4 rotulo text-creme rebaixado">
                  Da introdução, “O Silêncio da Madeira e o Grito da Vida”
                </figcaption>
              </figure>
            </Revelar>

            <ol className="mt-10 grid gap-x-8 gap-y-6 border-t border-creme/20 pt-8 sm:grid-cols-2">
              {MANUAL.map((parte, indice) => (
                <Revelar key={parte.titulo} como="li" atraso={200 + indice * 80}>
                  <span className="font-display text-h6 text-creme rebaixado">
                    {String(indice + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 text-h5 text-creme">{parte.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-creme/65">{parte.texto}</p>
                </Revelar>
              ))}
            </ol>

            <Revelar atraso={300}>
              <div className="mt-12 flex flex-wrap gap-3">
                <BotaoWhatsapp
                  variante="claro"
                  mensagem={`Olá, Carlos! Vim pelo seu site e gostaria de saber como conseguir o livro ${brand.livro.completo}.`}
                >
                  Quero um exemplar
                </BotaoWhatsapp>
                {!comoPagina && (
                  <Link href="/livro" className="btn-contorno-claro">
                    Sobre o livro
                  </Link>
                )}
              </div>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  )
}
