import { Check, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  categoriasDisponiveis,
  obras,
  rotulosCategoria,
  type CategoriaObra,
  type Obra,
} from '../data/obras'
import { cn } from '../lib/utils'
import Revelar from './Revelar'

interface SecaoAcervoProps {
  selecionadas: readonly string[]
  alternar: (slug: string) => void
  aoAbrir: (obra: Obra) => void
}

/**
 * Bloco 4, O ACERVO.
 * ==================
 *
 * O catálogo continua, mas dentro da página e sem rota própria. A peça abre
 * no visor, por cima, em vez de mandar a pessoa para outra URL: sair da
 * página no meio da escolha é o jeito mais rápido de perder quem estava
 * montando uma lista.
 *
 * O MOTOR É A SELEÇÃO
 * -------------------
 * Cada peça tem um "+". Quem marca três peças não precisa mandar três
 * mensagens: a barra que aparece embaixo monta uma mensagem só, com o nome e
 * a categoria de cada uma, e abre o WhatsApp do Carlos com ela escrita. É o
 * que transforma a vitrine em conversa.
 *
 * O filtro fica, porque aqui, diferente de uma apresentação de ateliê, a
 * pessoa às vezes chega procurando uma coisa só ("tem Santa Ceia?").
 */
export default function SecaoAcervo({ selecionadas, alternar, aoAbrir }: SecaoAcervoProps) {
  const [filtro, setFiltro] = useState<CategoriaObra | null>(null)

  const listadas = useMemo(
    () => (filtro ? obras.filter((obra) => obra.categoria === filtro) : obras),
    [filtro],
  )

  return (
    <section id="acervo" className="scroll-mt-4 border-t border-borda-sutil bg-creme">
      <div className="container-site secao-g">
        <div className="u-grid items-end">
          <div className="col-6">
            <Revelar>
              <span className="eyebrow block">O acervo</span>
              <h2 className="mt-4 texto-display-sm uppercase">
                Escolha o que te chamou
              </h2>
              <span className="filete mt-7" />
            </Revelar>
          </div>
          <div className="col-4 deslocar-8">
            <Revelar atraso={120}>
              <p className="text-tinta/70">
                Toque no <Plus size={14} strokeWidth={2} className="inline -translate-y-px" aria-hidden />{' '}
                das peças que você gostou. No fim, elas vão juntas numa mensagem
                só para o Carlos.
              </p>
            </Revelar>
          </div>
        </div>

        <Revelar atraso={160}>
          <div
            className="-mx-6 mt-14 flex gap-2.5 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
            role="group"
            aria-label="Filtrar por categoria"
          >
            <Chip ativo={filtro === null} aoClicar={() => setFiltro(null)}>
              Todas
            </Chip>
            {categoriasDisponiveis.map((categoria) => (
              <Chip key={categoria} ativo={filtro === categoria} aoClicar={() => setFiltro(categoria)}>
                {rotulosCategoria[categoria]}
              </Chip>
            ))}
          </div>
        </Revelar>

        {/* `key` no filtro: trocar de categoria refaz a cascata de entrada. */}
        <ul
          key={filtro ?? 'todas'}
          className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14"
        >
          {listadas.map((obra, indice) => (
            <Revelar key={obra.slug} como="li" distancia="curta" atraso={(indice % 4) * 80}>
              <CartaoObra
                obra={obra}
                marcada={selecionadas.includes(obra.slug)}
                alternar={() => alternar(obra.slug)}
                abrir={() => aoAbrir(obra)}
              />
            </Revelar>
          ))}
        </ul>

        <Revelar>
          <p className="mx-auto mt-20 max-w-md text-center text-sm text-tinta/60">
            Isto é uma parte do acervo. Procura um tema que não está aqui?
            Pergunte: com mais de trezentas peças, é bem possível que já exista.
          </p>
        </Revelar>
      </div>
    </section>
  )
}

function CartaoObra({
  obra,
  marcada,
  alternar,
  abrir,
}: {
  obra: Obra
  marcada: boolean
  alternar: () => void
  abrir: () => void
}) {
  return (
    <article className="group">
      <div className="relative overflow-hidden bg-borda-sutil">
        <button type="button" onClick={abrir} className="block w-full" aria-label={`Ver ${obra.nome} de perto`}>
          <img
            src={obra.imagens[0]}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-suave group-hover:scale-[1.045]"
          />
          {obra.imagens.length > 1 && (
            <span className="absolute bottom-2.5 left-2.5 bg-tinta/70 px-2 py-1 font-display text-[0.625rem] uppercase tracking-largo text-creme">
              {obra.imagens.length} fotos
            </span>
          )}
        </button>

        {/* 44px: o mínimo em que um polegar acerta. */}
        <button
          type="button"
          onClick={alternar}
          aria-pressed={marcada}
          aria-label={marcada ? `Tirar ${obra.nome} da seleção` : `Adicionar ${obra.nome} à seleção`}
          className={cn(
            'absolute right-2 top-2 inline-flex size-11 items-center justify-center border transition-all duration-300 ease-suave',
            marcada
              ? 'border-tinta bg-tinta text-creme'
              : 'border-creme/0 bg-creme/90 text-tinta hover:bg-tinta hover:text-creme',
          )}
        >
          {marcada ? <Check size={18} strokeWidth={1.75} /> : <Plus size={18} strokeWidth={1.5} />}
        </button>
      </div>

      <div className="pt-4">
        <span className="font-display text-[0.6875rem] uppercase tracking-largo text-cinza">
          {rotulosCategoria[obra.categoria]}
        </span>
        <h3 className="mt-1.5 text-h5 uppercase tracking-largo">{obra.nome}</h3>
        <p className="mt-1 hidden text-sm leading-snug text-tinta/60 sm:block">{obra.descricao}</p>
      </div>
    </article>
  )
}

function Chip({
  ativo,
  aoClicar,
  children,
}: {
  ativo: boolean
  aoClicar: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-pressed={ativo}
      className={cn(
        'shrink-0 whitespace-nowrap border px-5 py-3 font-display text-h6 uppercase leading-none tracking-largo',
        'transition-all duration-300 ease-suave',
        ativo
          ? 'border-tinta bg-tinta text-creme'
          : 'border-borda bg-transparent text-tinta hover:border-tinta',
      )}
    >
      {children}
    </button>
  )
}
