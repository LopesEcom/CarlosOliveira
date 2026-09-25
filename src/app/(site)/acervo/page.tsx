import type { Metadata } from 'next'
import Link from 'next/link'

import BarraSuperior from '../../../components/acervo/BarraSuperior'
import CapaColecao from '../../../components/acervo/CapaColecao'
import FiltrosCelular from '../../../components/acervo/FiltrosCelular'
import PainelFiltros from '../../../components/acervo/PainelFiltros'
import BotaoWhatsapp from '../../../components/BotaoWhatsapp'
import CabecalhoPagina from '../../../components/CabecalhoPagina'
import CapasColecoes from '../../../components/CapasColecoes'
import GradeObras from '../../../components/GradeObras'
import {
  capaDaColecao,
  colecaoSozinha,
  contarFiltros,
  escreverEstado,
  filtrar,
  lerEstado,
  montarFacetas,
  PASSO_PAGINA,
  temFiltro,
  type ParametrosBusca,
} from '../../../lib/dados/acervo'
import { getColecoes, getPecas } from '../../../lib/dados/consultas'

export const metadata: Metadata = {
  title: 'Acervo',
  description:
    'Peças entalhadas à mão por Carlos Oliveira: arte sacra, fauna, figuras, natureza, relógios e molduras. Filtre por coleção, tema, madeira e preço.',
  // Canônica sem os filtros: cada combinação é o mesmo acervo recortado, e
  // sem isto o Google trataria cada uma como uma página diferente.
  alternates: { canonical: '/acervo' },
}

/**
 * O ACERVO, NA ESTRUTURA DA LENNYS.
 * =================================
 *
 * Coleções em capas no alto, filtros na coluna da esquerda (numa gaveta, no
 * celular), a barra com busca e ordem, a grade, e "Carregar mais" no fim. O
 * estado inteiro vem da URL (ver lib/dados/acervo.ts), e a página é montada
 * no servidor a cada combinação: o link com filtro que o Carlos cola numa
 * conversa abre exatamente o recorte que ele viu.
 */
export default async function Acervo({ searchParams }: { searchParams: Promise<ParametrosBusca> }) {
  const estado = lerEstado(await searchParams)
  const [pecas, colecoes] = await Promise.all([getPecas(), getColecoes()])

  const facetas = montarFacetas(pecas, colecoes)
  const resultado = filtrar(pecas, estado)
  const visiveis = resultado.slice(0, estado.mostrar)

  /* Uma coleção escolhida, e nada mais: a página ganha a capa dela. */
  const slugSozinha = colecaoSozinha(estado)
  const colecao = slugSozinha ? colecoes.find((c) => c.slug === slugSozinha) : undefined

  return (
    <>
      {colecao ? (
        <CapaColecao colecao={colecao} capa={capaDaColecao(colecao, pecas)} pecas={resultado.length} />
      ) : (
        <CabecalhoPagina rotulo="O acervo" titulo="Peças prontas" italico="São mais de trezentas na oficina. Estas já estão aqui.">
          <p>
            Toque numa peça para ver de perto, com a ficha e o preço. O{' '}
            <span className="font-medium text-tinta">+</span> guarda a peça na sua seleção, que vai inteira numa
            mensagem só para o Carlos.
          </p>
        </CabecalhoPagina>
      )}

      {/* As capas só no acervo inteiro. Dentro de uma coleção quem situa é a
          capa dela; repetir a fileira ofereceria sair logo abaixo do título. */}
      {!colecao && !temFiltro(estado) && (
        <section className="bg-branco">
          <div className="container-site pb-16">
            <h2 className="rotulo text-cinza">Coleções</h2>
            <CapasColecoes colecoes={colecoes} pecas={pecas} className="mt-5" />
          </div>
        </section>
      )}

      <section className="border-t border-borda-sutil bg-branco">
        <div className="container-site flex gap-12 pb-24 pt-10 md:pb-32">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-28">
              <PainelFiltros facetas={facetas} estado={estado} idPrefixo="computador" />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <BarraSuperior
              estado={estado}
              total={resultado.length}
              filtro={<FiltrosCelular facetas={facetas} estado={estado} ativos={contarFiltros(estado)} />}
            />

            {visiveis.length > 0 ? (
              <>
                {/* `key` no recorte: trocar de filtro refaz a cascata de entrada. */}
                <GradeObras
                  key={escreverEstado({ ...estado, mostrar: PASSO_PAGINA })}
                  pecas={visiveis}
                  colunas={3}
                  prioridade={3}
                  className="mt-10"
                />

                {visiveis.length < resultado.length && (
                  <div className="mt-16 flex flex-col items-center gap-3">
                    <Link
                      href={escreverEstado({ ...estado, mostrar: estado.mostrar + PASSO_PAGINA })}
                      scroll={false}
                      className="btn-contorno"
                    >
                      Carregar mais
                    </Link>
                    <p className="text-xs text-cinza">
                      Mostrando {visiveis.length} de {resultado.length}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-10 flex flex-col items-start gap-5 border border-borda p-8">
                <h2 className="text-h3">Nenhuma peça com essa combinação</h2>
                <p className="max-w-prose text-tinta/70">
                  Tente tirar um dos filtros. E, se não achar, pergunte: com mais de
                  trezentas peças na oficina, é bem capaz de o que você procura já existir.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/acervo" className="btn-contorno">
                    Limpar filtros
                  </Link>
                  <BotaoWhatsapp
                    mensagem={
                      estado.busca
                        ? `Olá, Carlos! Procurei "${estado.busca}" no seu site e não achei. Você tem alguma peça assim?`
                        : 'Olá, Carlos! Vim pelo seu site e procuro uma peça que não achei no acervo.'
                    }
                  >
                    Perguntar ao Carlos
                  </BotaoWhatsapp>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
