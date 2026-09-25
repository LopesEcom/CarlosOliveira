'use client'

import { Check, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { fichaCurta } from '../lib/formato'
import { itemDaPeca } from '../lib/mensagens'
import { caminhoPeca } from '../lib/rotas'
import { useSelecao } from '../lib/selecao'
import { podeComprar, rotulosSituacao, rotulosTema, type Peca } from '../lib/tipos'
import { cn } from '../lib/utils'
import Preco from './Preco'
import Revelar from './Revelar'

interface GradeObrasProps {
  pecas: readonly Peca[]
  /** Quatro colunas no computador para o acervo inteiro; três ao lado dos filtros. */
  colunas?: 3 | 4
  /** As primeiras fotos carregam sem espera: são as que estão na tela ao abrir. */
  prioridade?: number
  className?: string
}

/**
 * A grade de peças, a mesma no início, no acervo e no pé da página de cada
 * peça. Um lugar só, para o cartão não ter três versões que envelhecem cada
 * uma de um jeito.
 */
export default function GradeObras({ pecas, colunas = 4, prioridade = 0, className }: GradeObrasProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 lg:gap-y-14',
        colunas === 4 && 'lg:grid-cols-4',
        className,
      )}
    >
      {pecas.map((peca, indice) => (
        <Revelar key={peca.id} como="li" distancia="curta" atraso={(indice % colunas) * 80}>
          <CartaoObra peca={peca} prioridade={indice < prioridade} />
        </Revelar>
      ))}
    </ul>
  )
}

/**
 * O CARTÃO: A FOTO LEVA À PÁGINA, O "+" GUARDA NA SELEÇÃO.
 * ========================================================
 *
 * Mesma estrutura do cartão da Lennys (foto, selo da etiqueta no canto,
 * segunda foto ao passar o mouse, nome e preço embaixo), com o que é só do
 * Carlos: o número da peça e o "+" que junta a peça numa mensagem só.
 */
export function CartaoObra({ peca, prioridade = false }: { peca: Peca; prioridade?: boolean }) {
  const { marcada, alternar } = useSelecao()
  const escolhida = marcada(peca.slug)
  const ficha = fichaCurta(peca)
  const escolhivel = podeComprar(peca)
  const caminho = caminhoPeca(peca)
  const [capa, segunda] = peca.imagens

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-borda-sutil">
        <Link href={caminho} className="relative block aspect-[3/4]" tabIndex={-1} aria-hidden>
          {capa && (
            <Image
              src={capa}
              alt=""
              fill
              priority={prioridade}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className={cn(
                'object-cover transition-transform duration-700 ease-suave group-hover:scale-[1.045]',
                peca.situacao === 'vendida' && 'opacity-80',
              )}
            />
          )}
          {/* A segunda foto aparece por cima no hover: mostra o outro lado da
              peça sem abrir a página. Sem segunda foto, fica o zoom. */}
          {segunda && (
            <Image
              src={segunda}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-500 ease-suave group-hover:opacity-100"
            />
          )}
        </Link>

        {/* O selo que o Carlos escreve no painel ("Novidade", "Última"). */}
        {peca.etiqueta && (
          <span className="rotulo-sm pointer-events-none absolute left-0 top-0 bg-branco px-2.5 py-1.5 text-tinta">
            {peca.etiqueta}
          </span>
        )}

        {/*
          Peça vendida, reservada ou do acervo pessoal continua no site (é
          prova de ofício), mas sem o "+": não dá para pedir o que não está à
          venda. No lugar dele, a situação, dita com todas as letras.
        */}
        {!escolhivel && (
          <span className="rotulo-sm absolute right-2 top-2 bg-tinta px-2.5 py-1.5 text-creme">
            {rotulosSituacao[peca.situacao]}
          </span>
        )}

        {/* 44px: o mínimo em que um polegar acerta. */}
        {escolhivel && (
          <button
            type="button"
            onClick={() => alternar(itemDaPeca(peca))}
            aria-pressed={escolhida}
            aria-label={escolhida ? `Tirar ${peca.nome} da seleção` : `Adicionar ${peca.nome} à seleção`}
            className={cn(
              'absolute right-2 top-2 inline-flex size-11 items-center justify-center border transition-all duration-300 ease-suave',
              escolhida
                ? 'border-tinta bg-tinta text-creme'
                : 'border-branco/0 bg-branco/90 text-tinta hover:bg-tinta hover:text-creme',
            )}
          >
            {escolhida ? <Check size={18} strokeWidth={1.75} /> : <Plus size={18} strokeWidth={1.5} />}
          </button>
        )}
      </div>

      <div className="pt-4">
        {/* No celular, só o número: com o tema junto, a linha quebrava em
            duas na coluna estreita e desalinhava a grade. */}
        <span className="rotulo text-cinza">
          Nº {peca.numero}
          <span className="hidden sm:inline"> · {rotulosTema[peca.tema]}</span>
        </span>
        {/* O link de verdade (o que o leitor de tela e o Tab encontram) é o
            nome; a foto repete o destino só para o dedo. */}
        <h3 className="mt-1.5 text-h4">
          <Link href={caminho} className="transition-colors duration-300 ease-suave hover:text-cinza">
            {peca.nome}
          </Link>
        </h3>
        <p className="mt-1 hidden text-sm leading-snug text-tinta/60 sm:block">{peca.descricao}</p>
        {ficha && <p className="mt-1.5 text-xs text-cinza">{ficha}</p>}
        <Preco peca={peca} className="mt-1.5" />
      </div>
    </article>
  )
}
