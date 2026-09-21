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
  { titulo: 'A ferramenta', texto: 'Quais goivas usar, para que serve cada perfil e como manter o fio.' },
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
 * A capa é tipográfica e provisória (ver CapaLivro) até a foto do exemplar
 * chegar.
 */
export default function SecaoLivro() {
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
              <h2 className="mt-4 texto-display uppercase text-creme">{brand.livro.titulo}</h2>
              <p className="t-italico mt-3 text-creme">{brand.livro.subtitulo}</p>
              <span className="filete-claro mt-8" />
            </Revelar>

            <Revelar atraso={160}>
              <div className="mt-8 max-w-xl space-y-5 text-creme/75">
                <p>
                  A autobiografia do Carlos, escrita por ele: como a goiva entrou
                  na vida dele e por que entalhar virou terapia — Petrópolis, os
                  vinte anos no Bexiga, a loja em Cabo Frio, a bancada.
                </p>
                <p>
                  E no fim, um manual de entalhes, passo a passo, para quem quiser
                  aprender também.
                </p>
              </div>
            </Revelar>

            <ol className="mt-10 grid gap-x-8 gap-y-6 border-t border-creme/20 pt-8 sm:grid-cols-2">
              {MANUAL.map((parte, indice) => (
                <Revelar key={parte.titulo} como="li" atraso={200 + indice * 80}>
                  <span className="font-display text-h6 text-creme rebaixado">
                    {String(indice + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 text-h6 uppercase tracking-largo text-creme">{parte.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-creme/65">{parte.texto}</p>
                </Revelar>
              ))}
            </ol>

            <Revelar atraso={300}>
              <BotaoWhatsapp
                variante="claro"
                className="mt-12"
                mensagem={`Olá, Carlos! Vim pelo seu site e gostaria de saber como conseguir o livro ${brand.livro.completo}.`}
              >
                Quero um exemplar
              </BotaoWhatsapp>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  )
}
