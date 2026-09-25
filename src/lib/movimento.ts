import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/**
 * MOVIMENTO, as fundações do editorial.
 * ======================================
 *
 * A apresentação precisa parecer uma sequência de páginas de revista, e não
 * uma página que rola. O que faz essa diferença não é o layout sozinho: é o
 * conteúdo CHEGAR quando a pessoa alcança ele, em vez de já estar lá.
 *
 * POR QUE À MÃO, E NÃO COM BIBLIOTECA
 * -----------------------------------
 * A recomendação inicial era usar uma biblioteca de animação. Duas coisas
 * mudaram a conta:
 *
 *  1. São QUATRO aplicações independentes (ver entradas/comum.tsx), cada uma
 *     com o próprio bundle. Uma dependência de ~30 KB não é paga uma vez.
 *  2. O que este projeto precisa é revelar ao entrar, escalonar e um
 *     deslocamento de parallax. Nada disso é animação de layout, é transição
 *     de CSS disparada por um observador. Biblioteca resolveria o mesmo com
 *     uma API maior.
 *
 * O custo de fazer à mão é não ter interpolação entre estados arbitrários.
 * Se um dia aparecer transição de página ou reordenação animada de grade,
 * aí sim vale trazer uma biblioteca, este arquivo não impede isso.
 *
 * ACESSIBILIDADE NÃO É OPCIONAL AQUI
 * ----------------------------------
 * Quem pediu `prefers-reduced-motion` costuma ter enjoo ou vertigem com
 * paralaxe. Neste arquivo o respeito a isso não é um `if` no fim: o estado
 * inicial já nasce "visível", então nenhum elemento chega a se mover.
 */

/** `true` quando o sistema pediu para reduzir movimento. */
export function movimentoReduzido(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(CONSULTA_MOVIMENTO).matches
}

const CONSULTA_MOVIMENTO = '(prefers-reduced-motion: reduce)'

/**
 * A mesma pergunta, mas como hook, para decidir O QUE montar.
 *
 * Existe por causa da pré-renderização. O HTML de cada página sai do build,
 * onde não há janela nem preferência de sistema, e o React exige que a
 * primeira renderização no navegador bata com aquele HTML. Chamar
 * `movimentoReduzido()` direto no render dava `false` no build e `true` no
 * celular de quem pediu menos movimento: HTML diferente, hidratação quebrada.
 *
 * O `useSyncExternalStore` resolve exatamente isso: na hidratação ele usa o
 * valor do servidor (`false`) e logo em seguida troca pelo de verdade.
 */
export function useMovimentoReduzido(): boolean {
  return useSyncExternalStore(assinarMovimento, movimentoReduzido, () => false)
}

function assinarMovimento(avisar: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {}
  const consulta = window.matchMedia(CONSULTA_MOVIMENTO)
  consulta.addEventListener('change', avisar)
  return () => consulta.removeEventListener('change', avisar)
}

/**
 * Sem observador não pode haver conteúdo escondido.
 *
 * A regra que evita o pior defeito possível deste arquivo: se o navegador não
 * tem `IntersectionObserver`, ou se a pessoa pediu menos movimento, tudo
 * começa revelado. Página em branco por causa de enfeite é falha grave, o
 * texto é o produto, a animação é o embrulho.
 */
function comecaRevelado(): boolean {
  if (typeof window === 'undefined') return true
  if (typeof IntersectionObserver === 'undefined') return true
  return movimentoReduzido()
}

interface OpcoesRevelar {
  /**
   * Quanto antes do elemento tocar a borda inferior a revelação dispara.
   * O padrão adianta um pouco, para o conteúdo já estar chegando quando entra
   * no campo de visão, revelar exatamente na borda parece atraso.
   */
  margem?: string
}

/**
 * Revela um elemento quando ele entra na tela. Uma vez só.
 *
 * Devolve a `ref` para pendurar no elemento e o estado. O visual mora no CSS
 * (`.revelar` / `.revelar-visivel` em index.css); aqui só se decide o quando.
 *
 * @example
 * const { alvo, visivel } = useRevelar<HTMLDivElement>()
 * return <div ref={alvo} className={cn('revelar', visivel && 'revelar-visivel')} />
 */
export function useRevelar<T extends HTMLElement = HTMLDivElement>({
  margem = '0px 0px -10% 0px',
}: OpcoesRevelar = {}) {
  const alvo = useRef<T>(null)
  /*
    Nasce `false` SEMPRE, e a exceção (sem observador, menos movimento) é
    decidida no efeito. Decidir aqui no estado inicial daria `true` no build,
    onde não há janela, e `false` no navegador: o HTML pré-renderizado e a
    primeira renderização discordariam, e o React não corrige classe em
    hidratação. O texto não fica escondido por isso: sem JavaScript a classe
    `js` não existe no <html> e o CSS não esconde nada (ver index.css).
  */
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (visivel) return
    if (comecaRevelado()) {
      setVisivel(true)
      return
    }
    const elemento = alvo.current
    if (!elemento) return

    const observador = new IntersectionObserver(
      ([entrada]) => {
        /*
          `isIntersecting` resolve o caso normal. O `top < 0` resolve o caso
          que quebra silenciosamente: recarregar a página no meio da rolagem,
          quando o navegador restaura a posição e o bloco já ficou ACIMA da
          tela. Ele nunca mais entra, e sem esta linha ficaria invisível para
          sempre.
        */
        if (entrada.isIntersecting || entrada.boundingClientRect.top < 0) {
          setVisivel(true)
          observador.disconnect()
        }
      },
      { rootMargin: margem, threshold: 0 },
    )

    observador.observe(elemento)
    return () => observador.disconnect()
  }, [visivel, margem])

  return { alvo, visivel }
}

/**
 * Deslocamento lento de uma imagem enquanto a página rola.
 *
 * O efeito é DE PROPÓSITO discreto: `intensidade` é a fração da altura da
 * tela que a imagem percorre a mais, e o padrão de 0,12 dá o suficiente para
 * a foto parecer atrás do texto sem virar carrossel de fundo.
 *
 * Escreve numa CSS variable em vez de mexer em `style.transform` para não
 * disputar a propriedade com nenhuma classe do Tailwind.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(intensidade = 0.12) {
  const alvo = useRef<T>(null)

  useEffect(() => {
    const elemento = alvo.current
    if (!elemento || movimentoReduzido()) return

    let agendado = false

    function posicionar() {
      agendado = false
      const atual = alvo.current
      if (!atual) return

      const caixa = atual.getBoundingClientRect()
      const alturaTela = window.innerHeight || 1

      /* Fora da tela não gasta cálculo nem pinta. */
      if (caixa.bottom < 0 || caixa.top > alturaTela) return

      /*
        -1 quando o bloco está inteiro abaixo da tela, +1 quando já passou
        inteiro por cima. No meio da tela dá 0, que é onde a foto fica na
        posição neutra, é isso que impede o corte aparecer na borda.
      */
      const progresso = (caixa.top + caixa.height / 2 - alturaTela / 2) / alturaTela
      const limitado = Math.max(-1, Math.min(1, progresso))

      atual.style.setProperty(
        '--parallax',
        `${(limitado * intensidade * alturaTela).toFixed(1)}px`,
      )
    }

    function aoRolar() {
      if (agendado) return
      agendado = true
      requestAnimationFrame(posicionar)
    }

    posicionar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)

    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [intensidade])

  return alvo
}

/**
 * `true` quando a tela tem largura de desktop.
 *
 * Existe para UMA decisão, e ela é grande: a seção de modelos tem duas
 * montagens completamente diferentes, e não duas aparências da mesma. Media
 * query não resolve isso, porque as duas montagens ficariam no HTML e o
 * navegador baixaria as fotos das duas.
 */
export function useTelaLarga(minimo = 1024): boolean {
  const consulta = `(min-width: ${minimo}px)`

  const assinar = useCallback(
    (avisar: () => void) => {
      const lista = window.matchMedia(consulta)
      lista.addEventListener('change', avisar)
      return () => lista.removeEventListener('change', avisar)
    },
    [consulta],
  )

  /* No build não há tela: `false`, e o navegador corrige logo depois da
     hidratação. Mesmo motivo do `useMovimentoReduzido`. */
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}

/**
 * ROLAGEM VERTICAL VIRANDO DESLOCAMENTO HORIZONTAL.
 * =================================================
 *
 * A seção fica presa na tela e o conteúdo dela anda de lado enquanto a pessoa
 * rola normalmente. É o que a referência faz com GSAP e ScrollTrigger; aqui é
 * um ouvinte de rolagem e uma variável de CSS, pelo mesmo motivo de sempre:
 * são quatro aplicações independentes e nenhuma delas paga 60 KB por isto.
 *
 * COMO A ALTURA APARECE
 * ---------------------
 * A seção não tem altura própria. Quem a cria é este arquivo: mede o trilho,
 * calcula quanto ele precisa andar, e escreve `--percurso`. A folha de estilo
 * transforma isso em altura (`100svh + percurso`), e essa altura extra é
 * exatamente o quanto a pessoa rola enquanto a tela fica parada.
 *
 * Sem a medida, a altura seria um número escolhido no chute, e ele quebraria
 * no dia em que o Carlos marcasse mais uma peça como destaque.
 *
 * O RITMO NÃO É 1:1, E ISSO É DELIBERADO
 * --------------------------------------
 * Na referência, um pixel rolado é um pixel andado. Lá são três cartões; aqui
 * são doze vestidos, e 1:1 daria mais de sete telas de rolagem presa numa
 * apresentação que tem meta de dois minutos. O ritmo abaixo de 1 faz o
 * conteúdo andar mais rápido que o dedo, encurtando a seção sem tirar peça
 * nenhuma da tela.
 */
export function useDeslizeHorizontal<
  E extends HTMLElement = HTMLDivElement,
  T extends HTMLElement = HTMLDivElement,
>(ativo: boolean, ritmo = 0.62) {
  const externo = useRef<E>(null)
  const trilho = useRef<T>(null)

  useEffect(() => {
    const fora = externo.current
    const dentro = trilho.current
    if (!fora || !dentro) return

    /*
      Desligado, a seção precisa VOLTAR ao normal, e não só parar de animar.
      Sem esta limpeza, trocar de desktop para celular deixaria a altura
      inflada e o conteúdo deslocado, com a seção presa em silêncio.
    */
    if (!ativo || movimentoReduzido()) {
      fora.style.removeProperty('--percurso')
      fora.style.removeProperty('--deslocamento')
      fora.style.removeProperty('--tela')
      return
    }

    let agendado = false
    let percurso = 0

    function medir() {
      const f = externo.current
      const d = trilho.current
      if (!f || !d) return

      /*
        A LARGURA DE REFERÊNCIA É A DA JANELA, E NUNCA `100vw`.

        `100vw` inclui a barra de rolagem: num desktop com barra clássica ele
        dá 1440 onde o conteúdo tem 1425. Os painéis de tela cheia nasciam 15px
        mais largos que a tela, saíam do centro, e a conta do percurso ficava
        devendo os mesmos 15px por painel. É a mesma armadilha que já obrigou
        `overflow-x: clip` no html deste projeto.

        Medido aqui, o número é o que a tela realmente tem, e a folha de estilo
        recebe pronto em `--tela`.
      */
      const janela = d.parentElement
      const largura = janela ? janela.clientWidth : window.innerWidth
      f.style.setProperty('--tela', `${largura}px`)

      /* O quanto o trilho é mais largo que a tela. Zero quando cabe, e aí a
         seção inteira se comporta como um bloco comum. */
      percurso = Math.max(0, d.scrollWidth - largura)
      f.style.setProperty('--percurso', `${Math.round(percurso * ritmo)}px`)
      posicionar()
    }

    function posicionar() {
      agendado = false
      const f = externo.current
      if (!f || percurso === 0) return

      const caixa = f.getBoundingClientRect()

      /*
        Quanto já passou do topo da seção, limitado ao trecho em que ela fica
        presa. Antes de encostar no topo é 0; depois de a seção terminar é o
        percurso inteiro. O limite é o que impede o trilho de continuar andando
        enquanto a próxima seção já está na tela.
      */
      const rolado = Math.min(Math.max(-caixa.top, 0), caixa.height - window.innerHeight)
      const progresso = (caixa.height - window.innerHeight) > 0
        ? rolado / (caixa.height - window.innerHeight)
        : 0

      f.style.setProperty('--deslocamento', `${-(progresso * percurso).toFixed(1)}px`)
    }

    function aoRolar() {
      if (agendado) return
      agendado = true
      requestAnimationFrame(posicionar)
    }

    medir()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', medir)

    /* O trilho muda de largura quando as fontes carregam e quando uma foto
       chega: sem observar, o percurso ficaria calculado sobre a medida errada
       do primeiro quadro e o último vestido nunca apareceria inteiro. */
    const observador = new ResizeObserver(medir)
    observador.observe(dentro)

    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', medir)
      observador.disconnect()
    }
  }, [ativo, ritmo])

  return { externo, trilho }
}
