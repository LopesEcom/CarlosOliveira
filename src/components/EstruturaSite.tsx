import type { ReactNode } from 'react'

import BarraSelecao from './BarraSelecao'
import Cabecalho from './Cabecalho'
import ProvedorContato from './ProvedorContato'
import ProvedorSelecao from './ProvedorSelecao'
import Rodape from './Rodape'
import { getConfiguracoes } from '../lib/dados/consultas'

/**
 * O QUE TODA PÁGINA DO SITE TEM.
 * ==============================
 *
 * Cabeçalho, conteúdo, o fecho com o rodapé, e a barra da seleção. A barra
 * mora aqui, e não em cada página, porque a seleção atravessa as páginas: a
 * pessoa marca no acervo, abre a peça, marca outra, e o botão de enviar
 * continua lá com as duas.
 *
 * As Configurações (WhatsApp, Instagram, mensagem) são lidas uma vez aqui,
 * no servidor, e descem para quem precisa.
 *
 * É componente, e não só o layout de src/app/(site)/, porque a página de
 * "não encontrada" da raiz também precisa dele: endereço que não existe não
 * passa pelo layout do grupo. O painel não usa: ele tem a casca dele.
 */
export default async function EstruturaSite({ children }: { children: ReactNode }) {
  const configuracoes = await getConfiguracoes()

  return (
    <ProvedorContato valor={configuracoes}>
      <ProvedorSelecao>
        {/* O primeiro Tab da página: pula o menu e vai direto ao conteúdo. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-tinta focus:px-5 focus:py-3 focus:rotulo focus:text-creme"
        >
          Pular para o conteúdo
        </a>

        <Cabecalho />

        <main id="conteudo" tabIndex={-1} className="outline-none">
          {children}
        </main>

        <Rodape configuracoes={configuracoes} />
        <BarraSelecao />
      </ProvedorSelecao>
    </ProvedorContato>
  )
}
