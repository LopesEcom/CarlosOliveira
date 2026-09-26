import Image from 'next/image'
import Link from 'next/link'

import { videoOficina } from '../data/bancada'
import Revelar from './Revelar'
import VideoVertical from './VideoVertical'

/**
 * Os três números que sustentam a página. Nenhum inventado: vêm da
 * introdução do livro dele e do que ele contou.
 */
const NUMEROS = [
  { valor: '58', rotulo: 'anos de bancada' },
  { valor: '300+', rotulo: 'peças no ateliê hoje' },
  { valor: '13', rotulo: 'anos, quando começou a entalhar' },
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
                O Carlos entalha desde os 13 anos. É o caçula de um tupieiro, aprendeu
                o ofício em Petrópolis e passou vinte anos em São Paulo, em duas firmas
                de entalhe: a Rusalém, na Bela Vista, e a Arte Ziggo, uma casa famosa
                onde não entrava qualquer um. Depois vieram as feiras de Niterói, a
                reforma de um castelo no Rio e a loja em Cabo Frio.
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

            {/* Pedido do Carlos: quem vê "300 peças" pensa que é tudo o que ele
                fez. As trezentas são as do ateliê hoje; a carreira foram
                milhares, quase todas por encomenda, e muitas foram para fora. */}
            <Revelar atraso={480}>
              <p className="mt-8 font-display text-h4 leading-snug">
                Mais de trezentas no ateliê, e milhares de peças espalhadas pelo
                Brasil e pelo mundo.
              </p>
            </Revelar>

            {/* O prêmio ganha linha própria: é o único reconhecimento de fora
                que a página tem, e é o que ele chama de símbolo da resiliência. */}
            <Revelar atraso={560}>
              {/* Com a foto da peça, pedido do Carlos: o prêmio é dela, e ver a
                  bailarina diz mais que o nome dela. */}
              <figure className="mt-10 flex items-center gap-5 border-l-2 border-tinta pl-5">
                <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-borda-sutil sm:w-36">
                  <Image
                    src="/atelier/bailarina.webp"
                    alt="Bailarina de madeira entalhada por Carlos Oliveira, a peça que ganhou o primeiro prêmio do Sebrae na Região dos Lagos."
                    fill
                    sizes="(min-width: 640px) 144px, 112px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-sm leading-relaxed text-tinta/75">
                  <span className="block rotulo text-tinta">Prêmio Sebrae</span>
                  Esta bailarina de madeira, entalhada por ele, ganhou o primeiro
                  prêmio do Sebrae na Região dos Lagos, em Cabo Frio.
                </figcaption>
              </figure>
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
