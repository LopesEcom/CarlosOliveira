'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'

import { linkWhatsApp } from '../lib/brand'
import { useConfiguracoes } from '../lib/contato'
import { mensagemSelecao } from '../lib/mensagens'
import { caminhoPeca } from '../lib/rotas'
import { useSelecao } from '../lib/selecao'
import { IconeWhatsapp } from './icones'

const CHAVE_CONTATO = 'carlos-oliveira:contato'

interface Contato {
  nome: string
  cidade: string
  observacao: string
}

const CONTATO_VAZIO: Contato = { nome: '', cidade: '', observacao: '' }

/**
 * Nome e cidade ficam guardados no navegador de quem preencheu, só por
 * conveniência: quem volta dias depois com outra seleção não precisa digitar
 * de novo. Nada disso sai do aparelho a não ser na mensagem que a própria
 * pessoa envia.
 */
function lerContato(): Contato {
  try {
    const salvo: unknown = JSON.parse(localStorage.getItem(CHAVE_CONTATO) ?? 'null')
    if (salvo && typeof salvo === 'object') return { ...CONTATO_VAZIO, ...(salvo as Partial<Contato>), observacao: '' }
  } catch {
    /* Sem armazenamento, o formulário só começa vazio. */
  }
  return CONTATO_VAZIO
}

/**
 * A REVISÃO ANTES DE ENVIAR (Etapa 5).
 * ====================================
 *
 * Na página única, o "Enviar" da barra ia direto para o WhatsApp. Com várias
 * páginas a lista cresce devagar, peça aqui, peça ali, e na hora de mandar a
 * pessoa quer ver o que juntou: as fotos, tirar a que desistiu, dizer de onde
 * é. Isto é o "carrinho" do site, sem pagamento: termina numa mensagem.
 *
 * Os campos são todos opcionais. Formulário obrigatório antes do WhatsApp é
 * o ponto em que quem só queria perguntar desiste.
 */
export default function PainelSelecao({ aoFechar }: { aoFechar: () => void }) {
  const { itens: obras, remover, limpar } = useSelecao()
  const { contato: configuracao } = useConfiguracoes()
  const [contato, setContato] = useState<Contato>(lerContato)
  const painel = useRef<HTMLDivElement>(null)

  /* Trava a rolagem do fundo, foca o painel, e o Esc fecha. */
  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    painel.current?.focus()
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = anterior
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aoFechar])

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_CONTATO, JSON.stringify({ nome: contato.nome, cidade: contato.cidade }))
    } catch {
      /* Sem armazenamento, vale só nesta visita. */
    }
  }, [contato.nome, contato.cidade])

  const mudar = (campo: keyof Contato) => (evento: { target: { value: string } }) =>
    setContato((atual) => ({ ...atual, [campo]: evento.target.value }))

  /* Num portal, direto no <body>: a barra que abre o painel é escura e
     fixa, e dentro dela o painel herdava a cor do texto e a camada. Só monta
     depois de um toque, então nunca entra na pré-renderização. */
  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-end text-tinta">
      {/* O fundo escurecido fecha ao toque: é o gesto que a mão já espera. */}
      <button type="button" aria-label="Fechar a seleção" onClick={aoFechar} className="absolute inset-0 bg-tinta/50" />

      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-selecao"
        tabIndex={-1}
        className="relative flex h-full w-full max-w-md flex-col bg-branco shadow-md outline-none"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-borda px-6 py-4">
          <h2 id="titulo-selecao" className="font-display text-h5">
            Sua seleção · {obras.length}
          </h2>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="-mr-2 inline-flex size-11 items-center justify-center text-tinta/70 transition-colors hover:text-tinta"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <ul className="border-t border-borda">
            {obras.map((obra) => (
              <li key={obra.slug} className="flex items-center gap-4 border-b border-borda py-3">
                <Link href={caminhoPeca(obra)} onClick={aoFechar} className="shrink-0">
                  {obra.capa ? (
                    // A capa guardada é a foto grande (2000 px); o otimizador
                    // manda a de 96 ou 256 px, conforme a tela.
                    <Image src={obra.capa} alt="" width={56} height={75} className="aspect-[3/4] w-14 bg-borda-sutil object-cover" />
                  ) : (
                    <span className="block aspect-[3/4] w-14 bg-borda-sutil" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <span className="block rotulo text-cinza">Nº {obra.numero}</span>
                  <Link
                    href={caminhoPeca(obra)}
                    onClick={aoFechar}
                    className="block truncate font-display text-h5 transition-colors hover:text-cinza"
                  >
                    {obra.nome}
                  </Link>
                  <span className="block text-xs text-cinza">{obra.preco ?? 'Valor sob consulta'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => remover(obra.slug)}
                  aria-label={`Tirar ${obra.nome} da seleção`}
                  className="inline-flex size-11 shrink-0 items-center justify-center text-tinta/60 transition-colors hover:text-tinta"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-5">
            <p className="text-sm text-tinta/70">
              Se quiser, diga seu nome e de onde você fala. Assim o Carlos já responde
              sobre a entrega na primeira mensagem.
            </p>
            <label className="block">
              <span className="label">Seu nome</span>
              <input type="text" autoComplete="name" value={contato.nome} onChange={mudar('nome')} className="input" />
            </label>
            <label className="block">
              <span className="label">Cidade e estado</span>
              <input
                type="text"
                autoComplete="address-level2"
                placeholder="Ex.: Niterói, RJ"
                value={contato.cidade}
                onChange={mudar('cidade')}
                className="input"
              />
            </label>
            <label className="block">
              <span className="label">Observação</span>
              <textarea
                rows={3}
                placeholder="Ex.: é para presente, preciso até dezembro."
                value={contato.observacao}
                onChange={mudar('observacao')}
                className="input resize-none"
              />
            </label>
          </div>
        </div>

        <div className="shrink-0 border-t border-borda px-6 py-5">
          <a
            href={linkWhatsApp(configuracao.whatsapp, mensagemSelecao(obras, contato))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primario w-full"
          >
            <IconeWhatsapp className="size-[1.15em] shrink-0" strokeWidth={1.75} />
            Enviar para o Carlos
          </a>
          <div className="mt-3 flex items-center justify-between gap-4 text-xs text-cinza">
            <span>Abre o WhatsApp com a mensagem pronta.</span>
            <button type="button" onClick={limpar} className="shrink-0 underline underline-offset-4 hover:text-tinta">
              Limpar tudo
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
