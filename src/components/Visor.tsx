import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { cn } from '../lib/utils'

interface VisorProps {
  imagens: string[]
  /** Qual foto abre. */
  indiceInicial: number
  /** Nome da peça, para o texto alternativo e para o título do diálogo. */
  nome: string
  /**
   * Recebe a foto em que o visor parou.
   *
   * Quem folheou até a quinta foto em tela cheia espera encontrar a quinta
   * ao fechar. Voltar para a primeira dá a impressão de que a navegação não
   * foi registrada, e na prova, obriga a refazer o caminho na frente da
   * noiva.
   */
  aoFechar: (indiceFinal: number) => void
  /** Uma ação ao lado do fechar. No site do Carlos: marcar a peça para a mensagem. */
  acao?: ReactNode
}

/** Quanto a foto cresce no zoom. Acima disso a renda vira mancha. */
const FATOR_ZOOM = 2.4

/** Distância mínima, em pixels, para um arrasto virar troca de foto. */
const LIMIAR_ARRASTO = 55

/**
 * A FOTO EM TELA CHEIA, o momento de venda.
 * ==========================================
 *
 * Este componente existe por causa de uma frase da conversa: o catálogo é a
 * ferramenta que a Danielli usa NA LOJA, ao apresentar os vestidos para a
 * noiva. Isso é uma tela sendo virada para outra pessoa, a dois palmos do
 * rosto, e nesse enquadramento a grade de cards não serve de nada.
 *
 * O que serve é a foto ocupando tudo, e o zoom. Vestido de noiva se vende no
 * detalhe: o bordado do corpete, o acabamento do decote, o tipo de renda. Sem
 * poder aproximar, a noiva pergunta "mas de perto como é?" e a resposta vira
 * uma ida até a arara.
 *
 * DECISÕES QUE PARECEM DETALHE E NÃO SÃO
 * --------------------------------------
 *  - O fundo é PRETO CHEIO, e não o preto suave da marca. Aqui a paleta cede
 *    para a foto: qualquer fundo com luz própria altera a cor do marfim, e
 *    cor de vestido é o que a noiva está tentando julgar.
 *  - O zoom foca ONDE a pessoa tocou, e não no centro. Zoom que vai sempre ao
 *    centro obriga a arrastar até o detalhe, e quem está segurando a tela para
 *    outra pessoa ver não tem mão sobrando.
 *  - Arrastar de lado troca de foto só quando NÃO está com zoom. Com zoom, o
 *    arrasto é para percorrer a imagem, que é o gesto que a mão já espera.
 */
export default function Visor({ imagens, indiceInicial, nome, aoFechar, acao }: VisorProps) {
  const [indice, setIndice] = useState(indiceInicial)
  const [zoom, setZoom] = useState(false)
  const [origem, setOrigem] = useState({ x: 50, y: 50 })
  const [deslocamento, setDeslocamento] = useState({ x: 0, y: 0 })
  /*
    Estado, e não `ref`: a classe de transição depende disto e precisa ser
    recalculada na renderização. Ler a `ref` do arrasto direto no `className`
    daria o valor do quadro anterior, sem nada que provocasse repintura.
  */
  const [arrastando, setArrastando] = useState(false)

  const dialogo = useRef<HTMLDivElement>(null)
  const inicioArrasto = useRef<{ x: number; y: number } | null>(null)
  const deslocamentoInicial = useRef({ x: 0, y: 0 })

  const varias = imagens.length > 1

  const irPara = useCallback(
    (proximo: number) => {
      /* Circular: no celular, chegar ao fim e o gesto não fazer nada é lido
         como travamento, não como fim da lista. */
      const total = imagens.length
      setIndice(((proximo % total) + total) % total)
      setZoom(false)
      setDeslocamento({ x: 0, y: 0 })
    },
    [imagens.length],
  )

  /* Teclado: a Danielli usa isto no computador da loja, não só no celular. */
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') aoFechar(indice)
      else if (evento.key === 'ArrowRight') irPara(indice + 1)
      else if (evento.key === 'ArrowLeft') irPara(indice - 1)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar, irPara, indice])

  /*
    Trava a rolagem do fundo. Sem isto, o gesto de arrastar a foto ampliada
    rola a página atrás e a pessoa fecha o visor achando que tocou fora.
    A posição anterior é restaurada porque o `overflow` pode já vir de outro
    lugar (o banner de cupom, por exemplo).
  */
  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogo.current?.focus()
    return () => {
      document.body.style.overflow = anterior
    }
  }, [])

  function alternarZoom(evento: PointerEvent<HTMLImageElement>) {
    if (zoom) {
      setZoom(false)
      setDeslocamento({ x: 0, y: 0 })
      return
    }

    /* Converte o ponto tocado em porcentagem da imagem: é isso que faz o
       zoom crescer a partir do detalhe, e não do meio. */
    const caixa = evento.currentTarget.getBoundingClientRect()
    setOrigem({
      x: ((evento.clientX - caixa.left) / caixa.width) * 100,
      y: ((evento.clientY - caixa.top) / caixa.height) * 100,
    })
    setDeslocamento({ x: 0, y: 0 })
    setZoom(true)
  }

  function aoPressionar(evento: PointerEvent<HTMLDivElement>) {
    inicioArrasto.current = { x: evento.clientX, y: evento.clientY }
    deslocamentoInicial.current = deslocamento
    setArrastando(true)
  }

  function aoMover(evento: PointerEvent<HTMLDivElement>) {
    const inicio = inicioArrasto.current
    if (!inicio || !zoom) return
    setDeslocamento({
      x: deslocamentoInicial.current.x + (evento.clientX - inicio.x),
      y: deslocamentoInicial.current.y + (evento.clientY - inicio.y),
    })
  }

  function aoSoltar(evento: PointerEvent<HTMLDivElement>) {
    const inicio = inicioArrasto.current
    inicioArrasto.current = null
    setArrastando(false)
    if (!inicio || zoom || !varias) return

    const dx = evento.clientX - inicio.x
    const dy = evento.clientY - inicio.y

    /* Só conta como troca se o gesto foi mais horizontal que vertical: numa
       tela alta, quase todo arrasto tem alguma componente de lado. */
    if (Math.abs(dx) < LIMIAR_ARRASTO || Math.abs(dx) < Math.abs(dy)) return
    irPara(indice + (dx < 0 ? 1 : -1))
  }

  return (
    <div
      ref={dialogo}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos da peça ${nome}`}
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex flex-col bg-black outline-none"
    >
      {/* Topo: contagem e fechar */}
      <div className="flex shrink-0 items-center justify-between p-4 text-creme/80 sm:p-5">
        <span className="font-display text-h6 uppercase tracking-largo">
          {nome}
          {varias && (
            <span className="ml-3 text-creme/50">
              {indice + 1}/{imagens.length}
            </span>
          )}
        </span>

        <div className="flex items-center gap-1">
          {acao}
          {/* O botão de zoom existe para quem navega por teclado: sem ele,
              aproximar a foto seria um recurso só de quem usa ponteiro. */}
          <BotaoVisor
            rotulo={zoom ? 'Afastar a foto' : 'Aproximar a foto'}
            aoClicar={() => {
              setZoom((v) => !v)
              setOrigem({ x: 50, y: 50 })
              setDeslocamento({ x: 0, y: 0 })
            }}
          >
            {zoom ? <ZoomOut size={20} strokeWidth={1.5} /> : <ZoomIn size={20} strokeWidth={1.5} />}
          </BotaoVisor>

          <BotaoVisor rotulo="Fechar" aoClicar={() => aoFechar(indice)}>
            <X size={22} strokeWidth={1.5} />
          </BotaoVisor>
        </div>
      </div>

      {/* Palco */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={() => {
          inicioArrasto.current = null
          setArrastando(false)
        }}
      >
        <img
          src={imagens[indice]}
          alt={`${nome}, foto ${indice + 1} de ${imagens.length}`}
          draggable={false}
          onPointerUp={(evento) => {
            /* Um arrasto não pode virar zoom por acidente. */
            const inicio = inicioArrasto.current
            if (inicio && Math.abs(evento.clientX - inicio.x) > 8) return
            alternarZoom(evento)
          }}
          className={cn(
            'max-h-full max-w-full select-none object-contain',
            /* `transition` só fora do arrasto: com ela ligada, o pan fica
               "molenga" porque cada quadro persegue o anterior. */
            !arrastando && 'transition-transform duration-500 ease-suave',
            zoom ? 'cursor-zoom-out' : 'cursor-zoom-in',
          )}
          style={{
            transformOrigin: `${origem.x}% ${origem.y}%`,
            transform: zoom
              ? `translate3d(${deslocamento.x}px, ${deslocamento.y}px, 0) scale(${FATOR_ZOOM})`
              : 'none',
            touchAction: zoom ? 'none' : 'pan-y',
          }}
        />

        {varias && !zoom && (
          <>
            <BotaoVisor
              rotulo="Foto anterior"
              aoClicar={() => irPara(indice - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-5"
            >
              <ChevronLeft size={26} strokeWidth={1.5} />
            </BotaoVisor>
            <BotaoVisor
              rotulo="Próxima foto"
              aoClicar={() => irPara(indice + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-5"
            >
              <ChevronRight size={26} strokeWidth={1.5} />
            </BotaoVisor>
          </>
        )}
      </div>

      {/* Miniaturas: numa prova a noiva pede "volta naquela de costas", e
          procurar isso arrastando uma por uma custa tempo de atendimento. */}
      {varias && (
        <div className="shrink-0 overflow-x-auto p-3 sm:p-5">
          <ul className="mx-auto flex w-max gap-2">
            {imagens.map((imagem, i) => (
              <li key={imagem}>
                <button
                  type="button"
                  onClick={() => irPara(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === indice}
                  className={cn(
                    'block size-14 overflow-hidden border-2 transition-colors duration-300 ease-suave sm:size-16',
                    i === indice ? 'border-creme' : 'border-transparent opacity-50 hover:opacity-100',
                  )}
                >
                  <img
                    src={imagem}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function BotaoVisor({
  rotulo,
  aoClicar,
  children,
  className,
}: {
  rotulo: string
  aoClicar: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={rotulo}
      className={cn(
        'inline-flex size-11 items-center justify-center bg-creme/10 text-creme',
        'transition-colors duration-300 ease-suave hover:bg-creme/25',
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-creme',
        className,
      )}
    >
      {children}
    </button>
  )
}
