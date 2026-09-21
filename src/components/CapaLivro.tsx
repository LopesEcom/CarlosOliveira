import { brand } from '../lib/brand'
import { cn } from '../lib/utils'

/**
 * Capa provisória do livro, composta em tipografia.
 *
 * NÃO é a capa real: é um lugar reservado, desenhado com a tipografia do
 * próprio site para o bloco do livro não ficar só texto. Assim que chegar a
 * foto do exemplar, troque este componente por uma <img> — o enquadramento
 * (3:4) já é o mesmo.
 *
 * É `aria-hidden` porque o título do livro já é dito em texto de verdade ao
 * lado; para um leitor de tela, ler de novo aqui só atrapalharia.
 */
export default function CapaLivro({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex aspect-[3/4] w-full flex-col justify-between border border-creme/25 bg-tinta p-8 md:p-10',
        className,
      )}
    >
      <span className="font-display text-h6 uppercase tracking-largo-lg text-creme/60">
        Autobiografia
      </span>

      <div>
        <p className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] uppercase leading-none tracking-largo text-creme">
          {brand.livro.titulo}
        </p>
        <span className="mt-6 block h-px w-16 bg-creme/70" />
        <p className="mt-6 font-display text-h5 font-light italic leading-snug text-creme/80">
          {brand.livro.subtitulo}
        </p>
      </div>

      <span className="font-display text-h6 uppercase tracking-largo text-creme/60">
        {brand.nome}
      </span>
    </div>
  )
}
