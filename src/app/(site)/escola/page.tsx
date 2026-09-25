import CabecalhoPagina from '../../../components/CabecalhoPagina'
import FormularioEscola from '../../../components/FormularioEscola'
import Revelar from '../../../components/Revelar'
import { brand } from '../../../lib/brand'

export const metadata = { title: 'Escola de entalhadores', description: 'Carlos Oliveira, Mestre Entalhador consagrado no Bixiga aos 21 anos, vai abrir uma escola de entalhe em madeira. Deixe seu nome para ser avisado das inscrições.', alternates: { canonical: '/escola' } }

/**
 * O que já se sabe e o que ainda não, dito com todas as letras.
 *
 * TODO: local, datas, duração, número de vagas, valor e para quem é
 * (iniciante ou quem já entalha) são decisões do Carlos que ainda não
 * existem. Nenhum deles foi inventado aqui; quando vierem, entram nesta
 * lista, e a pré-inscrição vira inscrição.
 */
const A_DEFINIR = ['Local', 'Datas e duração', 'Vagas por turma', 'Valor']

/**
 * A ESCOLA DE ENTALHADORES, ANTES DE ABRIR.
 * =========================================
 *
 * Nesta fase a página tem um trabalho só: juntar os interessados, já com o
 * que vai ajudar a montar as turmas (de onde são, se já entalham, quando
 * podem). É o que a pré-inscrição pergunta (ver FormularioEscola), e o
 * Carlos fica com a lista de gente para chamar quando as inscrições abrirem.
 */
export default function Escola() {
  return (
    <>

      <CabecalhoPagina
        rotulo="Em preparação"
        titulo="Escola de entalhadores"
        italico="Passar adiante o que o formão ensinou."
        foto={{
          // Foto de peça, e não do Carlos: o site mostra ele em duas fotos só
          // (a da história e a capa do livro).
          src: '/acervo/0034-aguia-sobre-o-bloco/capa-1200.webp',
          alt: 'Águia de asas erguidas entalhada sobre um bloco de madeira, por Carlos Oliveira.',
        }}
      >
        <p>
          O Carlos vai abrir uma escola para ensinar o entalhe do jeito que ele aprendeu: no formão e no malho, a partir do bloco maciço. As
          inscrições ainda não abriram.
        </p>
      </CabecalhoPagina>

      <section className="border-t border-borda-sutil bg-branco">
        <div className="container-site secao-g">
          <div className="u-grid">
            <div className="col-5">
              <Revelar>
                <span className="eyebrow block">Quem ensina</span>
                <h2 className="mt-4 texto-display-sm">Um mestre entalhador</h2>
                <span className="filete mt-7" />
              </Revelar>
            </div>
            <div className="col-6 deslocar-7 mt-6 md:mt-0">
              <Revelar atraso={120}>
                <div className="space-y-5 text-tinta/75">
                  <p>
                    Filho de tupieiro, aprendeu o ofício em Petrópolis e foi
                    consagrado Mestre Entalhador no Bixiga, em São Paulo, aos 21
                    anos. Hoje o acervo dele passa de trezentas peças.
                  </p>
                  <p>
                    No fim do livro dele, “{brand.livro.titulo}”, há um manual de
                    entalhes, escrito para quem quiser aprender. A escola é o
                    passo seguinte: o mesmo caminho, na bancada.
                  </p>
                </div>
              </Revelar>
            </div>
          </div>

          <Revelar>
            <div className="mt-20 border-t border-borda pt-10 md:mt-28">
              <span className="eyebrow block">Ainda sendo definido</span>
              <ul className="mt-6 grid grid-cols-2 gap-px border border-borda bg-borda md:grid-cols-4">
                {A_DEFINIR.map((item) => (
                  <li key={item} className="bg-branco p-5 md:p-6">
                    <span className="block rotulo">{item}</span>
                    <span className="mt-1.5 block text-sm text-cinza">Em breve</span>
                  </li>
                ))}
              </ul>
            </div>
          </Revelar>
        </div>
      </section>

      {/* Em creme, e não no escuro: logo abaixo vem o fecho do rodapé, que é
          escuro, e os dois juntos virariam um bloco só com dois convites. */}
      <section id="inscricao" className="scroll-mt-24 border-t border-borda-sutil bg-branco">
        <div className="container-site secao-g">
          <Revelar>
            <div className="text-center">
              <span className="eyebrow block">Pré-inscrição</span>
              <h2 className="t-italico-g mx-auto mt-6 max-w-[20ch]">Quer aprender com ele?</h2>
              <p className="mx-auto mt-7 max-w-md text-tinta/70">
                Deixe seu nome na lista. Assim que as turmas tiverem data, local e
                valor, o Carlos te chama.
              </p>
            </div>
          </Revelar>
          <Revelar atraso={120}>
            <div className="mt-12">
              <FormularioEscola />
            </div>
          </Revelar>
        </div>
      </section>
    </>
  )
}
