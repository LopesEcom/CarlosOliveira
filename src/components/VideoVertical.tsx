'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useMovimentoReduzido } from '../lib/movimento'
import { cn } from '../lib/utils'

interface VideoVerticalProps {
  /** Caminho do .mp4 a partir de /public. */
  src: string
  /** Versão menor, usada em tela estreita. Sem ela, vale `src` em todo lugar. */
  srcCelular?: string
  /** Pôster .webp, gerado por scripts/videos.mjs. */
  poster: string
  /**
   * Descrição do que se vê, para quem não vê.
   *
   * O vídeo é mudo e decorativo do ponto de vista da informação, mas não do
   * ponto de vista do conteúdo: quem usa leitor de tela precisa saber que ali
   * tem um vestido, e qual.
   */
  alt: string
  className?: string
}

/**
 * Vídeo vertical (9:16) que toca sozinho, mudo, em laço.
 *
 * DUAS VERSÕES DO MESMO VÍDEO
 * ---------------------------
 * A de 540px vai para telas estreitas, a de 720px para o resto. É metade dos
 * bytes num bloco que responde por quase todo o peso da apresentação, e a
 * maioria das noivas abre isto no celular, no 4G.
 *
 * NADA BAIXA ANTES DE ENTRAR NA TELA
 * ----------------------------------
 * `preload="none"` e o `src` só é preenchido quando o bloco chega ao campo de
 * visão. Três vídeos de ~2,5 MB carregados de largada seriam 7 MB gastos por
 * uma noiva que talvez pare na terceira folha, e esta apresentação vive de
 * ser aberta no 4G, no meio de uma conversa de WhatsApp.
 *
 * E PAUSA AO SAIR
 * ---------------
 * Vídeo tocando fora da tela é bateria e dados queimados sem ninguém ver.
 * O mesmo observador que dá o play tira quando o bloco sai.
 *
 * POR QUE MUDO
 * ------------
 * Não é escolha estética: navegador nenhum deixa um vídeo com som começar
 * sozinho. Os arquivos já vêm sem faixa de áudio (ver scripts/videos.mjs),
 * então não há nada para desmutar, se um dia entrar vídeo com a Danielli
 * falando, ele precisa de outro tratamento: capa e botão de play.
 *
 * ACESSIBILIDADE
 * --------------
 * Conteúdo que se move sozinho por mais de cinco segundos precisa de um jeito
 * de parar (WCAG 2.2.2), daí o botão de pausa, que aparece no hover e para
 * quem navega por teclado. E com `prefers-reduced-motion` o vídeo nem é
 * montado: fica o pôster, que é um quadro do próprio vídeo.
 */
export default function VideoVertical({
  src,
  srcCelular,
  poster,
  alt,
  className,
}: VideoVerticalProps) {
  const moldura = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  /*
    QUAL ARQUIVO, DECIDIDO UMA VEZ NA MONTAGEM.

    `<source media=...>` seria o caminho declarado, mas navegador nenhum o
    respeita de verdade há anos, a escolha por media query só funciona para
    imagem. Como o `src` deste componente já é preenchido por JavaScript
    quando o bloco entra na tela, decidir aqui não custa nada.

    Uma vez só, e não a cada redimensionamento: trocar o arquivo no meio
    reinicia o vídeo e baixa tudo de novo.
  */
  const [arquivo] = useState(() => {
    if (!srcCelular || typeof window === 'undefined' || !window.matchMedia) return src
    return window.matchMedia('(max-width: 639px)').matches ? srcCelular : src
  })

  const [carregar, setCarregar] = useState(false)
  const [naTela, setNaTela] = useState(false)
  const [tocando, setTocando] = useState(true)
  /* Pelo hook, e não lido direto: a página sai pré-renderizada do build, e
     o vídeo e o pôster são HTML diferentes (ver useMovimentoReduzido). */
  const semMovimento = useMovimentoReduzido()

  /* O observador só responde uma coisa: está na tela ou não. */
  useEffect(() => {
    if (semMovimento) return
    const alvo = moldura.current
    if (!alvo || typeof IntersectionObserver === 'undefined') return

    const observador = new IntersectionObserver(
      ([entrada]) => setNaTela(entrada.isIntersecting),
      /*
        40%, e o número tem uma razão precisa: no carrossel do celular o vídeo
        seguinte fica com 22% de largura à mostra, para dizer que dá para
        arrastar. Com um limiar de 25% aquele pedaço às vezes bastava para
        disparar o download, 1,2 MB de um vídeo que ninguém pediu.
      */
      { threshold: 0.4 },
    )

    observador.observe(alvo)
    return () => observador.disconnect()
  }, [semMovimento])

  /* Entrou na tela uma vez: o arquivo passa a valer a pena baixar. Não volta
     atrás, descarregar e rebaixar a cada rolagem seria pior que manter. */
  useEffect(() => {
    if (naTela) setCarregar(true)
  }, [naTela])

  /*
    O PLAY MORA AQUI, E NÃO NO OBSERVADOR.

    Chamar `play()` de dentro do callback do observador não funciona: naquele
    instante o `src` ainda é `undefined`, porque o React só o aplica no
    render seguinte. O vídeo recusava em silêncio e nunca mais tentava.
    Este efeito roda DEPOIS do render que já tem o `src`.
  */
  useEffect(() => {
    const elemento = video.current
    if (!elemento || semMovimento) return

    /* Os `paused` nas duas pontas evitam mandar o comando que já está valendo:
       este efeito roda de novo quando `carregar` vira true logo depois de
       `naTela`, e sem a guarda isso vira um play/pause/play visível. */
    if (naTela && carregar && tocando) {
      /* A promessa rejeita se o navegador recusar (aba em segundo plano,
         política de autoplay). Silenciar é o certo: o pôster continua na
         tela e nada quebra. */
      if (elemento.paused) elemento.play().catch(() => {})
    } else if (!naTela && !elemento.paused) {
      elemento.pause()
    }
  }, [naTela, carregar, tocando, semMovimento])

  function alternar() {
    const elemento = video.current
    if (!elemento) return
    if (elemento.paused) {
      elemento.play().catch(() => {})
      setTocando(true)
    } else {
      elemento.pause()
      setTocando(false)
    }
  }

  return (
    <div
      ref={moldura}
      className={cn('group relative overflow-hidden bg-tinta', className)}
    >
      {semMovimento ? (
        <img src={poster} alt={alt} className="aspect-[9/16] w-full object-cover" />
      ) : (
        <>
          <video
            ref={video}
            /* Vazio até entrar na tela, é isto que segura o download. */
            src={carregar ? arquivo : undefined}
            poster={poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={alt}
            className="aspect-[9/16] w-full object-cover"
          />

          <button
            type="button"
            onClick={alternar}
            aria-label={tocando ? `Pausar o vídeo: ${alt}` : `Tocar o vídeo: ${alt}`}
            /*
              VISÍVEL NO CELULAR, ESCONDIDO NO COMPUTADOR.

              `opacity-0 group-hover` sozinho fazia o botão simplesmente não
              existir no toque, não há hover num dedo. E ele não é enfeite:
              é a única forma de parar um vídeo que começa sozinho, que é
              exigência de acessibilidade (WCAG 2.2.2).

              44px porque é o mínimo em que um polegar acerta.
            */
            className="absolute bottom-2 right-2 inline-flex size-11 items-center justify-center
                       bg-tinta/60 text-creme transition-opacity duration-300 ease-suave
                       hover:bg-tinta/85 sm:bottom-3 sm:right-3 sm:size-10 sm:opacity-0
                       sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
          >
            {tocando ? (
              <Pause size={16} strokeWidth={1.75} aria-hidden />
            ) : (
              <Play size={16} strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </>
      )}
    </div>
  )
}
