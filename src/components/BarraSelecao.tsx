'use client'

import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { linkWhatsApp } from '../lib/brand'
import { useConfiguracoes } from '../lib/contato'
import { useSelecao } from '../lib/selecao'
import { cn } from '../lib/utils'
import { IconeWhatsapp } from './icones'
import PainelSelecao from './PainelSelecao'

/**
 * O CONTATO FLUTUANTE, QUE VIRA BARRA.
 * ====================================
 *
 * Vazio, é o botão redondo de WhatsApp de sempre, no canto. Com uma peça
 * marcada, cresce e vira a barra da seleção: quantas peças, e o botão que abre
 * a revisão (PainelSelecao), de onde a mensagem sai para o WhatsApp.
 *
 * Só aparece depois que a capa sai da tela. Na abertura, um botão flutuante
 * disputaria espaço com o nome colossal, justamente no instante em que ele
 * tem de ganhar — e a capa já tem o próprio botão de WhatsApp.
 *
 * O redondo é a única exceção ao canto reto da marca: é interface, não
 * superfície.
 */
export default function BarraSelecao() {
  const { itens, limpar } = useSelecao()
  const { contato } = useConfiguracoes()
  const [visivel, setVisivel] = useState(false)
  const [revisando, setRevisando] = useState(false)
  const fecharRevisao = useCallback(() => setRevisando(false), [])

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > window.innerHeight * 0.6)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  const total = itens.length

  /* Seleção esvaziada (tirou a última peça, ou "Limpar tudo") fecha a
     revisão. Sem isto, ela reabriria sozinha na próxima peça marcada. */
  if (total === 0 && revisando) setRevisando(false)

  if (total === 0) {
    return (
      <a
        href={linkWhatsApp(contato.whatsapp, 'Olá, Carlos! Vim pelo seu site e gostaria de mais informações.')}
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
      <p aria-live="polite" className="min-w-0 flex-1 rotulo">
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

      <button type="button" onClick={() => setRevisando(true)} className="btn-secundario btn-sm shrink-0">
        <IconeWhatsapp className="size-[1.15em] shrink-0" strokeWidth={1.75} />
        Enviar
      </button>

      {revisando && <PainelSelecao aoFechar={fecharRevisao} />}
    </div>
  )
}
