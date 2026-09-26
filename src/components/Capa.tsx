import Image from 'next/image'
import type { CSSProperties } from 'react'
import Link from 'next/link'

import { brand } from '../lib/brand'
import BotaoWhatsapp from './BotaoWhatsapp'
import Revelar from './Revelar'

const FOTO = '/capa/cristo.webp'

/**
 * Bloco 1, a abertura. Foto inteira, texto à esquerda, nome embaixo.
 * ==================================================================
 *
 * A estrutura segue a capa de ateliê de referência (Simone Sá): a foto
 * ocupa a tela, escurecida por igual, e um bloco de texto curto mora no
 * meio da altura, à esquerda, na ordem de leitura de uma vitrine:
 *
 *   1. RÓTULO     o ofício, em Inter caixa alta.
 *   2. TÍTULO     a frase do Carlos, na serifa.
 *   3. FILETE     um traço curto que separa a promessa da explicação.
 *   4. TEXTO      duas linhas sobre o que o site oferece.
 *   5. BOTÕES     o acervo (cheio, branco) e o WhatsApp (contorno).
 *
 * O que a referência não tem, e o Carlos tem, é o NOME colossal no pé: ele
 * é o H1 e faz o papel de logo enquanto a marca não existe. No celular vai
 * em duas linhas com o mesmo `--letras` (o da mais longa), para sair com o
 * mesmo corpo, alinhadas à esquerda como um carimbo.
 */
export default function Capa() {
  const [primeiro, ...resto] = brand.nome.split(' ')
  const linhas = [primeiro, resto.join(' ')]
  const letras = Math.max(...linhas.map((l) => l.length))

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-tinta">
      {/*
        Uma peça, e não o Carlos: a capa vende o trabalho. É a foto de onde
        saiu a og-image (o busto de Cristo na bancada, com o oratório atrás),
        no mesmo recorte: a coroa e os olhos, de lado a lado da tela, como a
        foto da referência. Por cima, véus leves, para a madeira aparecer: por
        igual (mais forte no celular, onde o texto cobre a foto), no alto (a
        logo), da esquerda (o texto) e de baixo (o nome).
      */}
      <Image
        src={FOTO}
        alt="Busto de Cristo com coroa de espinhos, entalhado em madeira por Carlos Oliveira, na bancada da oficina."
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_30%] lg:object-[50%_22%]"
      />
      <div aria-hidden className="absolute inset-0 bg-tinta/55 lg:bg-tinta/30" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,rgb(var(--tinta-rgb)/0.5),rgb(var(--tinta-rgb)/0))]" />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgb(var(--tinta-rgb)/0.75)_20%,rgb(var(--tinta-rgb)/0)_62%,rgb(var(--tinta-rgb)/0)_100%)] lg:block"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgb(var(--tinta-rgb)/0.7),rgb(var(--tinta-rgb)/0))]"
      />

      {/* O MEIO: o bloco de texto, abaixo do cabeçalho flutuante. */}
      <div className="relative flex flex-1 items-center pt-24 md:pt-28">
        <div className="container-site">
          <div className="max-w-[34rem]">
            <Revelar atraso={140} naPrimeiraTela>
              <p className="rotulo text-creme rebaixado">Mestre entalhador · 58 anos de bancada</p>
              {/* Palavras dele, da introdução do livro. */}
              <p className="mt-5 font-display text-h2 font-normal leading-tight text-creme">
                Uma vida inteira dedicada a transformar o bruto em belo
              </p>
              <span className="filete-claro mt-7" />
            </Revelar>
            <Revelar atraso={240} naPrimeiraTela>
              <p className="mt-7 max-w-[28rem] text-creme/85">
                Peças entalhadas à mão, cada uma tirada de um bloco só de madeira.
                Escolha a que falou com você e fale direto com o Carlos.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/acervo" className="btn-secundario">
                  Ver o acervo
                </Link>
                <BotaoWhatsapp
                  variante="contorno-claro"
                  mensagem="Olá, Carlos! Vim pelo seu site e gostaria de conversar sobre uma peça."
                >
                  Falar com o Carlos
                </BotaoWhatsapp>
              </div>
            </Revelar>
          </div>
        </div>
      </div>

      {/* O PÉ: o nome. */}
      <div className="container-site caixa-colosso relative mt-12 pb-5 md:mt-16 md:pb-7">
        <Revelar distancia="curta" atraso={360} naPrimeiraTela>
          {/*
            Duas montagens do mesmo nome. No computador, uma linha só, que
            atravessa a tela. No celular, uma linha só daria letra de 40px;
            empilhado, o nome volta a ser cartaz. As montagens são
            `aria-hidden` e o nome é lido uma vez, pelo texto escondido.
          */}
          <h1 className="text-creme">
            <span className="sr-only">{brand.nome}</span>
            <span
              aria-hidden
              className="texto-colosso block md:hidden"
              style={{ '--letras': letras } as CSSProperties}
            >
              {linhas.map((linha) => (
                <span key={linha} className="block">
                  {linha}
                </span>
              ))}
            </span>
            <span
              aria-hidden
              className="texto-colosso hidden md:block"
              style={{ '--letras': brand.nome.length } as CSSProperties}
            >
              {brand.nome}
            </span>
          </h1>
        </Revelar>
      </div>
    </section>
  )
}
