import EstruturaSite from '../components/EstruturaSite'
import NaoEncontrada from '../components/NaoEncontrada'

export const metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: true },
}

/**
 * Endereço que não existe, ou peça que saiu do ar. O Next responde com
 * status 404, e a página oferece as portas: o acervo e algumas peças.
 */
export default function NaoEncontradaRaiz() {
  return (
    <EstruturaSite>
      <NaoEncontrada />
    </EstruturaSite>
  )
}
