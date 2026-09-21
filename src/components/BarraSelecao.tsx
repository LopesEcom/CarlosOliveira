import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { buscarObra, rotulosCategoria } from '../data/obras'
import { linkWhatsApp } from '../lib/brand'
import { cn } from '../lib/utils'
import { IconeWhatsapp } from './icones'

interface BarraSelecaoProps {
  selecionadas: readonly string[]
  limpar: () => void
}

/**
 * Monta a mensagem única com as peças marcadas.
 *
 * Nome e categoria de cada uma, uma por linha: com mais de trezentas peças na
 * oficina, "a coruja" sozinho não identifica nada, e o Carlos precisa saber
 * qual é logo na primeira leitura.
 */
function mensagemDaSelecao(slugs: readonly string[]) {
  const linhas = slugs
    .map(buscarObra)
    .filter((obra) => obra !== undefined)
    .map((obra) => `• ${obra.nome} (${rotulosCategoria[obra.categoria]})`)

  return [
    'Olá, Carlos! Vi o seu site e gostei destas peças:',
    '',
    ...linhas,
    '',
    'Pode me passar medidas e valores?',
  ].join('\n')
}

/**
 * O CONTATO FLUTUANTE, QUE VIRA BARRA.
 * ====================================
 *
 * Vazio, é o botão redondo de WhatsApp de sempre, no canto. Com uma peça
 * marcada, cresce e vira a barra da seleção: quantas peças, e o botão que abre
 * o WhatsApp com a mensagem pronta.
 *
 * Só aparece depois que a capa sai da tela. Na abertura, um botão flutuante
 * disputaria espaço com o nome colossal, justamente no instante em que ele
 * tem de ganhar — e a capa já tem o próprio botão de WhatsApp.
 *
 * O redondo é a única exceção ao canto reto da marca: é interface, não
 * superfície.
 */
export default function BarraSelecao({ selecionadas, limpar }: BarraSelecaoProps) {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > window.innerHeight * 0.6)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  const total = selecionadas.length

  if (total === 0) {
    return (
      <a
        href={linkWhatsApp('Olá, Carlos! Vim pelo seu site e gostaria de mais informações.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com o Carlos no WhatsApp"
        className={cn(
          'fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-tinta text-creme shadow-md',
          'transition-all duration-500 ease-suave hover:bg-cinza md:bottom-8 md:right-8',
          visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <IconeWhatsapp width={26} height={26} strokeWidth={1.5} />
      </a>
    )
  }

  return (
    <div
      role="region"
      aria-label="Peças selecionadas"
      className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 bg-tinta p-2 pl-5 text-creme shadow-md
                 sm:inset-x-auto sm:right-8 sm:bottom-8 sm:min-w-[24rem]"
    >
      <p aria-live="polite" className="min-w-0 flex-1 font-display text-h6 uppercase tracking-largo">
        {total} {total === 1 ? 'peça escolhida' : 'peças escolhidas'}
      </p>

      <button
        type="button"
        onClick={limpar}
        aria-label="Limpar a seleção"
        className="inline-flex size-11 shrink-0 items-center justify-center text-creme/70 transition-colors hover:text-creme"
      >
        <X size={18} strokeWidth={1.5} />
      </button>

      <a
        href={linkWhatsApp(mensagemDaSelecao(selecionadas))}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secundario btn-sm shrink-0"
      >
        <IconeWhatsapp className="size-[1.15em] shrink-0" strokeWidth={1.75} />
        Enviar
      </a>
    </div>
  )
}
