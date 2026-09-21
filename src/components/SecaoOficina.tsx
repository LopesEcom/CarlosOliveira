import { videoOficina } from '../data/bancada'
import { trajetoria } from '../data/trajetoria'
import Revelar from './Revelar'
import VideoVertical from './VideoVertical'

/** Os três números que sustentam a página. Nenhum inventado: vêm do Carlos. */
const NUMEROS = [
  { valor: '300+', rotulo: 'peças prontas' },
  { valor: '20', rotulo: 'anos no Bexiga, em São Paulo' },
  { valor: '1', rotulo: 'bloco de madeira por peça' },
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
 * DEPOIS, O CAMINHO
 * -----------------
 * A trajetória em quatro paradas fecha a seção numa régua que atravessa a
 * largura. É prova também, de outro tipo: não o que dizem dele, mas o tempo
 * de bancada por trás de cada peça.
 */
export default function SecaoOficina() {
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
              <h2 className="mt-4 texto-display-sm uppercase">
                Aprendeu em Petrópolis. Firmou a mão no Bexiga.
              </h2>
              <span className="filete mt-7" />
            </Revelar>

            <Revelar atraso={160}>
              <p className="mt-8 max-w-lg text-tinta/75">
                Foram vinte anos trabalhando na Bela Vista, em São Paulo, antes da
                loja própria em Cabo Frio. Hoje o acervo passa de trezentas peças
                prontas — arte sacra, bichos, figuras, relógios e molduras —,
                todas tiradas de madeira maciça, à goiva.
              </p>
            </Revelar>

            <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-borda pt-8">
              {NUMEROS.map((numero, indice) => (
                <Revelar key={numero.rotulo} atraso={220 + indice * 90}>
                  <dt className="sr-only">{numero.rotulo}</dt>
                  <dd>
                    <span className="block font-display text-[clamp(2.25rem,6vw,3.5rem)] font-light leading-none">
                      {numero.valor}
                    </span>
                    <span className="mt-3 block text-xs leading-snug text-cinza sm:text-sm">
                      {numero.rotulo}
                    </span>
                  </dd>
                </Revelar>
              ))}
            </dl>
          </div>
        </div>

        {/* A trajetória atravessa a largura, numa régua de quatro paradas. */}
        <div className="mt-24 md:mt-32">
          <Revelar>
            <p className="eyebrow text-center">O caminho até aqui</p>
          </Revelar>

          <ol className="relative mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* A linha que liga as paradas, só onde elas ficam lado a lado. */}
            <span aria-hidden className="absolute left-0 right-0 top-[0.4rem] hidden h-px bg-borda lg:block" />
            {trajetoria.map((etapa, indice) => (
              <Revelar key={etapa.id} como="li" atraso={indice * 110} className="relative">
                <span aria-hidden className="relative block size-3 rounded-full border border-tinta bg-branco" />
                <span className="eyebrow mt-6 block">{etapa.lugar}</span>
                <h3 className="mt-2 text-h5 uppercase tracking-largo">{etapa.titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-tinta/70">{etapa.texto}</p>
              </Revelar>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
