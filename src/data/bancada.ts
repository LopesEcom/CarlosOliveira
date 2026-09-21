/**
 * Vídeos da bancada.
 *
 * Recortes curtos dos vídeos de WhatsApp que o Carlos mandou, reencodados em
 * 480px de largura e sem áudio (ver public/videos/). Os originais continuam
 * em "imagens Carlos/" e têm até sete minutos: para a página, quinze segundos
 * em laço dizem mais do que sete minutos que ninguém assiste.
 */
export interface VideoBancada {
  id: string
  src: string
  poster: string
  titulo: string
  /** Lido pelo leitor de tela no lugar do vídeo. */
  alt: string
}

/** O vídeo da seção de abertura: o Carlos entalhando a águia. */
export const videoOficina: VideoBancada = {
  id: 'aguia',
  src: '/videos/aguia.mp4',
  poster: '/videos/aguia.webp',
  titulo: 'A águia',
  alt: 'Carlos Oliveira entalhando uma águia de asas abertas com goiva e malho, na bancada da oficina.',
}

export const videosBancada: VideoBancada[] = [
  {
    id: 'rosto-na-tora',
    src: '/videos/rosto-na-tora.mp4',
    poster: '/videos/rosto-na-tora.webp',
    titulo: 'O rosto na tora',
    alt: 'Carlos abrindo um rosto em relevo numa tora com casca, a golpes de malho sobre a goiva.',
  },
  {
    id: 'painel',
    src: '/videos/painel.mp4',
    poster: '/videos/painel.webp',
    titulo: 'O painel',
    alt: 'Carlos entalhando um painel em relevo, com as goivas enfileiradas na frente da bancada.',
  },
  {
    id: 'acervo',
    src: '/videos/acervo.mp4',
    poster: '/videos/acervo.webp',
    titulo: 'As prateleiras',
    alt: 'Passeio pela oficina mostrando a rosa entalhada, uma imagem sacra e bustos prontos.',
  },
]

/**
 * Falas do Carlos, intercaladas com as fotos no deslize.
 *
 * TODO: foram escritas a partir do que ele contou (a terapia, o bloco
 * maciço, as mais de trezentas peças), não ditas por ele. Vale ele reescrever
 * com as palavras dele: é o trecho da página que mais muda de tom quando a
 * voz é a própria.
 */
export const falas = [
  'Comecei a entalhar por terapia. Não parei mais.',
  'Não uso molde, não uso resina, não colo. Cada peça sai de um bloco só.',
  'Quem decide por onde a figura aparece é o veio da madeira.',
]

export const FRASE_DA_CASA =
  'Nenhuma peça é igual à outra, porque nenhuma madeira é igual à outra.'
