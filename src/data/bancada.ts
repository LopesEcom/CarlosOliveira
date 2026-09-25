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
 * Tiradas da introdução do livro dele, "O Silêncio da Madeira e o Grito da
 * Vida" (foto em imagens Carlos/livro-introducao.jpg). Trechos curtos e com
 * as palavras dele; os cortes só tiram o que dependia do resto do
 * parágrafo, sem trocar palavra dele.
 */
export const falas = [
  'Olhando hoje para as minhas mãos, vejo as cicatrizes e as vitórias de uma vida inteira dedicada à arte de transformar o bruto em belo.',
  'Meu formão esculpiu mais do que madeira: esculpiu a minha própria cura.',
  'Assim como um bloco de madeira bruta esconde uma obra de arte em seu interior, a nossa vida também exige que saibamos retirar os excessos.',
]

/** A frase que fecha o deslize. É também a última linha da introdução. */
export const FRASE_DA_CASA =
  'Enquanto houver madeira e fôlego, o formão nunca irá parar.'
