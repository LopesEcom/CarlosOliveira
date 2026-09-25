import { trajetoria } from '../data/trajetoria'
import Revelar from './Revelar'

/**
 * O CAMINHO ATÉ AQUI, a trajetória em seis paradas.
 * =================================================
 *
 * É prova também, de outro tipo: não o que dizem dele, mas o tempo de
 * bancada por trás de cada peça. Mora na página da história; no início, a
 * seção da oficina só aponta para cá.
 */
export default function SecaoTrajetoria() {
  return (
    <section className="border-t border-borda-sutil bg-branco">
      <div className="container-site secao-g">
        <Revelar>
          <span className="eyebrow block text-center">O caminho até aqui</span>
          <h2 className="t-italico mx-auto mt-5 max-w-[30ch] text-center">
            Um caminho sinuoso, nas palavras dele.
          </h2>
        </Revelar>

        {/*
          Seis paradas em duas fileiras de três. Cada parada leva o próprio
          trecho de linha, e não uma linha única atrás da fileira: com seis
          itens a grade quebra, e uma linha de largura cheia ficaria cruzando
          o vão entre as fileiras.
        */}
        <ol className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {trajetoria.map((etapa, indice) => (
            <Revelar key={etapa.id} como="li" atraso={(indice % 3) * 110} className="relative">
              <span aria-hidden className="flex items-center gap-3">
                <span className="block size-3 shrink-0 rounded-full border border-tinta bg-branco" />
                <span className="h-px flex-1 bg-borda" />
              </span>
              <span className="eyebrow mt-6 block">{etapa.lugar}</span>
              <h3 className="mt-2 text-h5">{etapa.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-tinta/70">{etapa.texto}</p>
            </Revelar>
          ))}
        </ol>
      </div>
    </section>
  )
}
