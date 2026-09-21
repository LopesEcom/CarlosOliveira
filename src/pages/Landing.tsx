import { Check, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'

import BarraSelecao from '../components/BarraSelecao'
import Capa from '../components/Capa'
import DeslizeObras from '../components/DeslizeObras'
import Faq from '../components/Faq'
import Rodape from '../components/Rodape'
import SecaoAcervo from '../components/SecaoAcervo'
import SecaoBancada from '../components/SecaoBancada'
import SecaoEncomenda from '../components/SecaoEncomenda'
import SecaoLivro from '../components/SecaoLivro'
import SecaoOficina from '../components/SecaoOficina'
import Seo from '../components/Seo'
import Visor from '../components/Visor'
import { obrasDestaque, type Obra } from '../data/obras'
import { movimentoReduzido } from '../lib/movimento'
import { cn } from '../lib/utils'

/**
 * A PÁGINA DO CARLOS: UMA LANDING COM ACERVO DENTRO.
 * ==================================================
 *
 * Ele não precisa de site institucional com menu e página de "Sobre": precisa
 * de um link que ele cole numa conversa ou na bio e que, em dois minutos de
 * polegar, faça três coisas nesta ordem — mostrar que a mão é dele, mostrar
 * as peças, e devolver a pessoa para o WhatsApp com a escolha feita.
 *
 *   1  Capa        o nome colossal sobre a foto dele com a águia
 *   2  Oficina     o vídeo na bancada, os números e o caminho até aqui
 *   3  Deslize     peças em destaque atravessando a tela, com a voz dele
 *   4  Acervo      o catálogo inteiro, com filtro, visor e seleção
 *   5  Bancada     três vídeos curtos de entalhe
 *   6  Livro       a autobiografia e o manual de entalhes
 *   7  Encomenda   para quem não achou o que queria
 *   8  Dúvidas
 *   9  Fecho       a pergunta e o contato, com a assinatura
 *
 * O estado mora aqui porque é dividido: a seleção é marcada no acervo e no
 * visor, e enviada pela barra flutuante; o visor é aberto pelo deslize e
 * pelo acervo.
 */
export default function Landing() {
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [aberta, setAberta] = useState<Obra | null>(null)

  const alternar = useCallback((slug: string) => {
    setSelecionadas((atual) =>
      atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug],
    )
  }, [])

  const marcada = aberta ? selecionadas.includes(aberta.slug) : false

  return (
    <div className="bg-creme">
      <Seo descricao="Carlos Oliveira, escultor entalhador: mais de 300 peças entalhadas à mão em madeira maciça — arte sacra, fauna, figuras, relógios e molduras. Peças prontas e encomendas." />

      <main>
        <Capa />
        <SecaoOficina />
        {/* Sem movimento pedido pelo sistema, o deslize não monta: o acervo
            logo abaixo mostra as mesmas peças. */}
        {!movimentoReduzido() && <DeslizeObras obras={obrasDestaque} aoAbrir={setAberta} />}
        <SecaoAcervo selecionadas={selecionadas} alternar={alternar} aoAbrir={setAberta} />
        <SecaoBancada />
        <SecaoLivro />
        <SecaoEncomenda />
        <Faq />
      </main>

      <Rodape />

      <BarraSelecao selecionadas={selecionadas} limpar={() => setSelecionadas([])} />

      {aberta && (
        <Visor
          key={aberta.slug}
          imagens={aberta.imagens}
          indiceInicial={0}
          nome={aberta.nome}
          aoFechar={() => setAberta(null)}
          acao={
            <button
              type="button"
              onClick={() => alternar(aberta.slug)}
              aria-pressed={marcada}
              className={cn(
                'mr-2 inline-flex h-11 items-center gap-2 px-4 font-display text-h6 uppercase tracking-largo transition-colors duration-300 ease-suave',
                marcada ? 'bg-creme text-tinta' : 'bg-creme/10 text-creme hover:bg-creme/25',
              )}
            >
              {marcada ? <Check size={16} strokeWidth={1.75} /> : <Plus size={16} strokeWidth={1.5} />}
              <span className="hidden sm:inline">{marcada ? 'Escolhida' : 'Escolher'}</span>
            </button>
          }
        />
      )}
    </div>
  )
}
