'use client'

import { useRouter } from 'next/navigation'
import { useCallback, type ReactNode } from 'react'

import { alternar, escreverEstado, PASSO_PAGINA, temFiltro, type EstadoAcervo, type Facetas } from '../../lib/dados/acervo'
import { precoBRL } from '../../lib/formato'
import type { Tema } from '../../lib/tipos'
import { cn } from '../../lib/utils'
import FaixaPreco from './FaixaPreco'

interface PainelFiltrosProps {
  facetas: Facetas
  estado: EstadoAcervo
  /** Chamado depois de aplicar um filtro. A gaveta do celular usa para se fechar. */
  aoAplicar?: () => void
  /**
   * Prefixo dos `id`. A coluna do computador e a gaveta do celular existem ao
   * mesmo tempo no HTML (uma escondida por CSS), e sem prefixo todo `label`
   * apontaria para o primeiro controle.
   */
  idPrefixo: string
}

/**
 * OS FILTROS DO ACERVO.
 * =====================
 *
 * Os grupos da Lennys, com o vocabulário do Carlos: coleção (o lugar da
 * casa), tema, madeira e preço. Nenhum filtro guarda estado: tudo é lido da
 * URL e escrito nela. Recarregar, voltar ou colar o link no WhatsApp repetem
 * a mesma seleção.
 *
 * Toda mudança volta a paginação ao começo, senão a pessoa filtraria e
 * continuaria vendo 36 peças de um resultado que agora tem 4.
 *
 * Grupo sem opção não aparece: enquanto nenhuma peça tem madeira na ficha,
 * não há filtro de madeira; enquanto tudo é sob consulta, não há faixa de
 * preço.
 */
export default function PainelFiltros({ facetas, estado, aoAplicar, idPrefixo }: PainelFiltrosProps) {
  const router = useRouter()

  const aplicar = useCallback(
    (mudanca: Partial<EstadoAcervo>) => {
      router.push(escreverEstado({ ...estado, ...mudanca, mostrar: PASSO_PAGINA }), { scroll: false })
      aoAplicar?.()
    },
    [estado, router, aoAplicar],
  )

  return (
    <div className="flex flex-col gap-9">
      {temFiltro(estado) && (
        <button
          type="button"
          onClick={() => {
            router.push('/acervo', { scroll: false })
            aoAplicar?.()
          }}
          className="rotulo self-start text-tinta underline underline-offset-4 hover:text-cinza"
        >
          Limpar filtros
        </button>
      )}

      {facetas.colecoes.length > 0 && (
        <Grupo titulo="Coleção">
          <ListaMarcavel
            opcoes={facetas.colecoes}
            marcados={estado.colecoes}
            idPrefixo={`${idPrefixo}-colecao`}
            aoAlternar={(valor) => aplicar({ colecoes: alternar(estado.colecoes, valor) })}
          />
        </Grupo>
      )}

      <Grupo titulo="Tema">
        <ListaMarcavel
          opcoes={facetas.temas}
          marcados={estado.temas}
          idPrefixo={`${idPrefixo}-tema`}
          aoAlternar={(valor) => aplicar({ temas: alternar(estado.temas, valor as Tema) })}
        />
      </Grupo>

      {facetas.madeiras.length > 0 && (
        <Grupo titulo="Madeira">
          <ul className="flex flex-wrap gap-2">
            {facetas.madeiras.map((opcao) => {
              const marcada = estado.madeiras.includes(opcao.valor)
              return (
                <li key={opcao.valor}>
                  <button
                    type="button"
                    aria-pressed={marcada}
                    onClick={() => aplicar({ madeiras: alternar(estado.madeiras, opcao.valor) })}
                    className={cn(
                      'border px-3 py-2 text-sm transition-colors duration-300 ease-suave',
                      marcada ? 'border-tinta bg-tinta text-creme' : 'border-borda hover:border-tinta',
                    )}
                  >
                    {opcao.rotulo}
                    <span className="sr-only">, {opcao.total} peças</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Grupo>
      )}

      {facetas.precoMax > facetas.precoMin && (
        <Grupo titulo="Preço">
          <FaixaPreco
            min={facetas.precoMin}
            max={facetas.precoMax}
            valorMin={estado.precoMin ?? facetas.precoMin}
            valorMax={estado.precoMax ?? facetas.precoMax}
            aoMudar={(min, max) =>
              aplicar({
                precoMin: min === facetas.precoMin ? undefined : min,
                precoMax: max === facetas.precoMax ? undefined : max,
              })
            }
            formatar={precoBRL}
          />
          <p className="text-xs text-cinza">Peças sob consulta não entram quando a faixa está ligada.</p>
        </Grupo>
      )}

      {facetas.temIndisponivel && (
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={estado.soAVenda}
            onChange={(e) => aplicar({ soAVenda: e.target.checked })}
            className="size-4 accent-[rgb(var(--tinta-rgb))]"
          />
          Só as que estão à venda
        </label>
      )}
    </div>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="rotulo text-tinta">{titulo}</h3>
      {children}
    </section>
  )
}

function ListaMarcavel({
  opcoes,
  marcados,
  idPrefixo,
  aoAlternar,
}: {
  opcoes: Facetas['temas']
  marcados: readonly string[]
  idPrefixo: string
  aoAlternar: (valor: string) => void
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {opcoes.map((opcao) => {
        const id = `${idPrefixo}-${opcao.valor}`
        return (
          <li key={opcao.valor} className="flex items-center gap-3">
            <input
              id={id}
              type="checkbox"
              checked={marcados.includes(opcao.valor)}
              onChange={() => aoAlternar(opcao.valor)}
              className="size-4 shrink-0 cursor-pointer accent-[rgb(var(--tinta-rgb))]"
            />
            <label htmlFor={id} className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-sm">
              <span>{opcao.rotulo}</span>
              <span className="text-xs text-cinza">{opcao.total}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
