'use client'

import { BookOpen, Check, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'

import { registrarEvento } from '../../app/acoes/eventos'
import { linkWhatsApp } from '../../lib/brand'
import { useConfiguracoes } from '../../lib/contato'
import { textoPreco } from '../../lib/formato'
import { itemDaPeca, mensagemCompra } from '../../lib/mensagens'
import { CAMINHO_APRENDER, ehExterno } from '../../lib/rotas'
import { useSelecao } from '../../lib/selecao'
import { podeComprar, type Peca } from '../../lib/tipos'
import { cn } from '../../lib/utils'
import { IconeWhatsapp } from '../icones'
import Preco from '../Preco'

type Opcao = 'levar' | 'aprender'

/**
 * AS DUAS FORMAS DE FICAR COM A PEÇA.
 * ===================================
 *
 * Quem abre a página de uma peça quer uma de duas coisas: levar a peça para
 * casa, ou aprender a fazer uma assim. As duas aparecem lado a lado como
 * opções, no formato de cartão que se escolhe (o da referência do Edson), e
 * um botão só, embaixo, faz o que a opção escolhida pede:
 *
 *   LEVAR      abre o WhatsApp com a mensagem pronta, com o número e o link
 *              da peça. Peça vendida ou reservada vira "uma parecida, sob
 *              encomenda", quando o Carlos aceita.
 *   APRENDER   leva ao livro do Carlos, que tem o manual de entalhes no fim.
 *              Hoje é a apostila dele (fora do site); quando a landing do livro existir, é
 *              só trocar CAMINHO_APRENDER em lib/rotas.ts.
 *
 * Nome e cidade são opcionais, e só aparecem na opção de levar: são o que o
 * Carlos precisaria perguntar de volta para falar de entrega.
 */
export default function Compra({ peca }: { peca: Peca }) {
  const { contato, mensagemPeca } = useConfiguracoes()
  const { marcada, alternar } = useSelecao()
  const [opcao, setOpcao] = useState<Opcao>('levar')
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')

  const aVenda = podeComprar(peca)
  const levarDisponivel = aVenda || peca.aceitaEncomenda
  const escolhida = marcada(peca.slug)
  const mensagem = mensagemCompra(mensagemPeca, peca, { nome, cidade })

  const tituloLevar = aVenda ? 'Levar esta peça' : 'Uma parecida, sob encomenda'
  const detalheLevar = aVenda
    ? 'Peça única, entalhada à mão. Pronta na oficina.'
    : `Esta ${peca.situacao === 'vendida' ? 'já foi vendida' : peca.situacao === 'reservada' ? 'está reservada' : 'é do acervo pessoal do Carlos'}. Ele entalha outra no mesmo espírito.`

  return (
    <div>
      <fieldset>
        {/* O rótulo entre filetes, como o "How many rooms?" da referência. */}
        <legend className="flex w-full items-center gap-4 text-sm font-semibold">
          <span aria-hidden className="h-px flex-1 bg-borda" />
          Como você quer esta peça?
          <span aria-hidden className="h-px flex-1 bg-borda" />
        </legend>

        <div className="mt-5 grid gap-3">
          {levarDisponivel && (
            <CartaoOpcao
              valor="levar"
              atual={opcao}
              aoEscolher={setOpcao}
              titulo={tituloLevar}
              detalhe={detalheLevar}
              lado={
                aVenda && textoPreco(peca) ? <Preco peca={peca} /> : <span className="rotulo-sm text-cinza">Sob consulta</span>
              }
            >
              <p className="text-sm text-tinta/70">
                A mensagem já vai com o número e o link desta peça. Se quiser, diga de
                onde você fala, que o Carlos já responde sobre a entrega.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Seu nome</span>
                  <input type="text" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} className="input" />
                </label>
                <label className="block">
                  <span className="label">Cidade e estado</span>
                  <input
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Ex.: Niterói, RJ"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="input"
                  />
                </label>
              </div>
            </CartaoOpcao>
          )}

          <CartaoOpcao
            valor="aprender"
            atual={levarDisponivel ? opcao : 'aprender'}
            aoEscolher={setOpcao}
            titulo="Aprender a fazer"
            detalhe="O livro do Carlos, com o manual de entalhes no fim."
            lado={<BookOpen size={22} strokeWidth={1.25} aria-hidden className="text-tinta/70" />}
          >
            <p className="text-sm text-tinta/70">
              A história de como ele chegou a peças como esta e, no fim, um manual de entalhes escrito para
              quem quiser aprender o ofício.
            </p>
          </CartaoOpcao>
        </div>
      </fieldset>

      <div className="mt-5">
        {opcao === 'levar' && levarDisponivel ? (
          <a
            href={linkWhatsApp(contato.whatsapp, mensagem)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void registrarEvento('clique_whatsapp', peca.id)}
            className="btn-primario w-full"
          >
            <IconeWhatsapp className="size-[1.15em] shrink-0" strokeWidth={1.75} />
            {aVenda ? 'Comprar pelo WhatsApp' : 'Pedir pelo WhatsApp'}
          </a>
        ) : (
          <Link
            href={CAMINHO_APRENDER}
            {...(ehExterno(CAMINHO_APRENDER) && { target: '_blank', rel: 'noopener noreferrer' })}
            onClick={() => void registrarEvento('clique_aprender', peca.id)}
            className="btn-primario w-full"
          >
            <BookOpen size={17} strokeWidth={1.5} aria-hidden />
            Conhecer o livro
          </Link>
        )}

        <p className="mt-3 text-center text-xs text-cinza">
          {opcao === 'levar' && levarDisponivel
            ? textoPreco(peca)
              ? 'Pagamento e entrega você combina direto com o Carlos.'
              : 'O Carlos responde com medidas, madeira, valor e entrega.'
            : 'A apostila do Carlos mostra o método, passo a passo.'}
        </p>
      </div>

      {aVenda && (
        <button
          type="button"
          onClick={() => alternar(itemDaPeca(peca))}
          aria-pressed={escolhida}
          className="mt-6 inline-flex items-center gap-2 text-sm underline decoration-borda underline-offset-4 transition-colors hover:decoration-tinta"
        >
          {escolhida ? <Check size={15} strokeWidth={1.75} aria-hidden /> : <Plus size={15} strokeWidth={1.5} aria-hidden />}
          {escolhida ? 'Está na sua seleção' : 'Juntar a outras peças numa mensagem só'}
        </button>
      )}
    </div>
  )
}

/**
 * Um cartão que se escolhe. O rádio de verdade fica escondido e o cartão
 * inteiro é o rótulo dele: o teclado e o leitor de tela continuam valendo.
 * Escolhido, o cartão ganha a borda cheia e abre o que tem por dentro.
 */
function CartaoOpcao({
  valor,
  atual,
  aoEscolher,
  titulo,
  detalhe,
  lado,
  children,
}: {
  valor: Opcao
  atual: Opcao
  aoEscolher: (valor: Opcao) => void
  titulo: string
  detalhe: string
  lado: ReactNode
  children: ReactNode
}) {
  const escolhido = atual === valor

  return (
    <div
      className={cn(
        'border bg-branco transition-colors duration-300 ease-suave',
        escolhido ? 'border-tinta shadow-[inset_0_0_0_1px_rgb(var(--tinta-rgb))]' : 'border-borda hover:border-tinta/50',
      )}
    >
      <label className="flex cursor-pointer items-center gap-4 p-5">
        <input
          type="radio"
          name="forma"
          value={valor}
          checked={escolhido}
          onChange={() => aoEscolher(valor)}
          className="size-4 shrink-0 accent-[rgb(var(--tinta-rgb))]"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{titulo}</span>
          <span className="mt-0.5 block text-sm text-cinza">{detalhe}</span>
        </span>
        <span className="shrink-0 text-right">{lado}</span>
      </label>
      {escolhido && <div className="border-t border-borda-sutil px-5 pb-5 pt-4">{children}</div>}
    </div>
  )
}
