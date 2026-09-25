import { cn } from '../../lib/utils'

/**
 * A chave liga/desliga do painel ("No site", "Destaque"). O único redondo da
 * interface além do botão de WhatsApp: é controle, não superfície.
 */
export default function Interruptor({
  rotulo,
  ligado,
  aoMudar,
}: {
  /** Lido pelo leitor de tela: diga o que a chave faz. */
  rotulo: string
  ligado: boolean
  aoMudar: (valor: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      onClick={() => aoMudar(!ligado)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ease-suave',
        ligado ? 'border-tinta bg-tinta' : 'border-borda bg-borda-sutil',
      )}
    >
      <span className="sr-only">{rotulo}</span>
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 size-[1.125rem] rounded-full bg-branco shadow-sm transition-all duration-200 ease-suave',
          ligado ? 'left-[1.3rem]' : 'left-0.5',
        )}
      />
    </button>
  )
}
