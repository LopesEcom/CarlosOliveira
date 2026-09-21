import { videosBancada } from '../data/bancada'
import Revelar from './Revelar'
import VideoVertical from './VideoVertical'

/**
 * Bloco 5, A BANCADA EM MOVIMENTO.
 * ================================
 *
 * O que a foto não conta: o malho batendo, o cavaco saindo, a figura
 * aparecendo na tora. Três vídeos verticais, lado a lado no computador.
 *
 * No celular viram um carrossel com o próximo vídeo espiando na borda, que é
 * o que diz "dá para arrastar" sem escrever. Cada vídeo só baixa quando
 * aparece de verdade na tela (ver VideoVertical), então a espiada não custa
 * download.
 */
export default function SecaoBancada() {
  return (
    <section className="border-t border-borda-sutil bg-branco">
      <div className="container-site secao-g">
        <Revelar>
          <div className="flex flex-col items-center text-center">
            <span className="eyebrow block">Na bancada</span>
            <h2 className="mt-4 texto-display-sm uppercase">De perto, e em movimento</h2>
            <span className="filete mt-7" />
            <p className="mt-7 max-w-md text-tinta/70">
              Goiva, malho e madeira maciça. Sem máquina de cópia, sem atalho.
            </p>
          </div>
        </Revelar>

        <div className="-mx-6 mt-14 overflow-hidden md:mx-0">
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
            {videosBancada.map((video, indice) => (
              <Revelar
                key={video.id}
                como="li"
                distancia="curta"
                atraso={indice * 110}
                className="w-[74%] shrink-0 snap-center md:w-auto"
              >
                <VideoVertical src={video.src} poster={video.poster} alt={video.alt} />
                <p className="mt-4 font-display text-h6 uppercase tracking-largo">{video.titulo}</p>
              </Revelar>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
