import Link from 'next/link'

import { videoOficina } from '../data/bancada'
import Revelar from './Revelar'
import VideoVertical from './VideoVertical'

/**
 * Os três números que sustentam a página. Nenhum inventado: vêm da
 * introdução do livro dele e do que ele contou.
 */
const NUMEROS = [
  { valor: '300+', rotulo: 'peças no acervo' },
  { valor: '21', rotulo: 'anos, quando virou Mestre Entalhador' },
  { valor: '72', rotulo: 'anos, e o formão não parou' },
]

/**
 * Bloco 2, a autoridade.
 * ======================
 *
 * O VÍDEO PROVA QUE A MÃO EXISTE
 * ------------------------------
 * A primeira dúvida silenciosa de quem abre um link de artesão é se aquilo é
 * dele ou foto de revenda. Quinze segundos do Carlos batendo o malho na
 * águia resolvem isso sem uma palavra, e por isso o vídeo vem antes do texto.
 *
 * O CAMINHO FOI PARA A PÁGINA DA HISTÓRIA
 * ----------------------------------------
 * Na página única, a trajetória fechava esta seção. Agora ela é o corpo da
 * página /historia (ver SecaoTrajetoria), e no início fica só a porta para
 * ela: o início tem de chegar às peças depressa.
 */
export default function SecaoOficina({ comLinkHistoria = false }: { comLinkHistoria?: boolean }) {
  return (
    <section className="border-t border-borda-sutil bg-branco">
      <div className="container-site secao-g">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:gap-20">
          <Revelar distancia="nenhuma" className="mx-auto w-full max-w-sm lg:max-w-none">
            <VideoVertical
              src={videoOficina.src}
              poster={videoOficina.poster}
              alt={videoOficina.alt}
            />
          </Revelar>

          <div>
            <Revelar atraso={80}>
              <span className="eyebrow block">A oficina</span>
              <h2 className="mt-4 texto-display-sm">
                Com 21 anos, já era Mestre Entalhador no Bixiga.
              </h2>
              <span className="filete mt-7" />
            </Revelar>

            <Revelar atraso={160}>
              <p className="mt-8 max-w-lg text-tinta/75">
                O Carlos é o caçula de um tupieiro. Aprendeu o ofício em Petrópolis e
                passou vinte anos trabalhando em São Paulo. Depois vieram as feiras de
                Niterói, a reforma de um castelo no Rio e a loja em Cabo Frio. Hoje são
                mais de trezentas peças: arte sacra, bichos, figuras, relógios e
                molduras, todas tiradas da madeira maciça.
              </p>
            </Revelar>

            <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-borda pt-8">
              {NUMEROS.map((numero, indice) => (
                <Revelar key={numero.rotulo} atraso={220 + indice * 90}>
                  <dt className="sr-only">{numero.rotulo}</dt>
                  <dd>
                    <span className="block font-display text-[clamp(2.25rem,6vw,3.5rem)] font-normal leading-none">
                      {numero.valor}
                    </span>
                    <span className="mt-3 block text-xs leading-snug text-cinza sm:text-sm">
                      {numero.rotulo}
                    </span>
                  </dd>
                </Revelar>
              ))}
            </dl>

            {/* O prêmio ganha linha própria: é o único reconhecimento de fora
                que a página tem, e é o que ele chama de símbolo da resiliência. */}
            <Revelar atraso={500}>
              <p className="mt-10 border-l-2 border-tinta pl-5 text-sm leading-relaxed text-tinta/75">
                <span className="block rotulo text-tinta">
                  Prêmio Sebrae
                </span>
                Uma bailarina de madeira entalhada por ele foi premiada como a
                melhor da Região dos Lagos.
              </p>
            </Revelar>
          </div>
        </div>

        {comLinkHistoria && (
          <Revelar>
            <div className="mt-16 flex justify-center md:mt-20">
              <Link href="/historia" className="btn-contorno">
                Conheça a história dele
              </Link>
            </div>
          </Revelar>
        )}
      </div>
    </section>
  )
}
