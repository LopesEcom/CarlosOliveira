import type { CSSProperties } from 'react'

import { brand } from '../lib/brand'
import BotaoWhatsapp from './BotaoWhatsapp'
import Revelar from './Revelar'

const FOTO = '/atelier/carlos-e-aguia.webp'

/**
 * Bloco 1, a abertura. Composição de folha de rosto.
 * ==================================================
 *
 * Três faixas, e cada uma tem um trabalho:
 *
 *   1. ALTO      o ofício e o número, do tamanho de rodapé de revista.
 *   2. MEIO      a foto, sozinha. Nenhum texto mora no meio: é ali que o véu
 *                abre e o Carlos aparece ao lado da águia.
 *   3. RODAPÉ    a frase, os dois caminhos e o NOME colossal, que é a marca.
 *
 * O NOME É O H1, E É A LOGO
 * -------------------------
 * Sem logo desenhada, o nome em corpo de cartaz faz o trabalho: ocupando a
 * largura inteira, ele deixa de ser título e vira imagem. No celular vai em
 * duas linhas com o mesmo `--letras` (o da mais longa), para sair com o
 * mesmo corpo, alinhadas à esquerda como um carimbo.
 *
 * Sem cabeçalho fixo, de propósito: barra fixa é chrome de site, e isto é
 * uma página de apresentação. O caminho de volta ao contato está no botão
 * flutuante, ver BarraSelecao.
 */
export default function Capa() {
  const [primeiro, ...resto] = brand.nome.split(' ')
  const linhas = [primeiro, resto.join(' ')]
  const letras = Math.max(...linhas.map((l) => l.length))

  return (
    <section className="relative flex min-h-svh flex-col justify-between overflow-hidden bg-tinta">
      {/*
        No celular a foto enche a tela. No computador ela recua para a
        direita: é um retrato, e esticada em paisagem cortaria o rosto do
        Carlos para caber a águia. À esquerda fica a nogueira chapada, e um
        degradê costura as duas metades por baixo do nome.
      */}
      <img
        src={FOTO}
        alt="Carlos Oliveira na oficina, ao lado de uma águia de asas abertas entalhada em madeira."
        fetchPriority="high"
        decoding="async"
        className="absolute inset-y-0 right-0 h-full w-full object-cover object-[50%_25%] lg:w-[60%] lg:object-[50%_15%]"
      />
      <div aria-hidden className="veu-capa" />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgb(var(--tinta-rgb))_40%,rgb(var(--tinta-rgb)/0)_62%)] lg:block"
      />

      {/* FAIXA DE CIMA */}
      <div className="container-site relative pt-7 md:pt-9">
        <Revelar distancia="curta">
          <div className="flex items-start justify-between gap-6 font-display text-[0.6875rem] uppercase tracking-largo-lg text-creme">
            <p className="leading-relaxed">
              {brand.subtitulo}
              <span className="block rebaixado">Petrópolis · São Paulo · Cabo Frio</span>
            </p>
            <p className="hidden text-right leading-relaxed sm:block">
              Mais de 300 peças
              <span className="block rebaixado">entalhadas à mão</span>
            </p>
          </div>
        </Revelar>
      </div>

      {/* FAIXA DE BAIXO */}
      <div className="relative">
        <div className="container-site u-grid items-end">
          <div className="col-6">
            <Revelar atraso={140}>
              <p className="t-italico-g text-creme">
                Cada peça saiu de um bloco de madeira, pela mão dele.
              </p>
              <span className="filete-claro mt-6" />
            </Revelar>
          </div>

          <div className="col-4 deslocar-8">
            <Revelar atraso={240}>
              <p className="text-sm text-creme rebaixado">
                Sem molde, sem resina, sem emenda. Veja um pouco do acervo, escolha
                o que te chamou e mande para ele numa mensagem só.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#acervo" className="btn-secundario btn-sm">
                  Ver o acervo
                </a>
                <BotaoWhatsapp
                  variante="contorno-claro"
                  tamanho="sm"
                  mensagem="Olá, Carlos! Vim pelo seu site e gostaria de conversar sobre uma peça."
                >
                  WhatsApp
                </BotaoWhatsapp>
              </div>
            </Revelar>
          </div>
        </div>

        <div className="container-site caixa-colosso relative mt-10 pb-5 md:mt-14 md:pb-7">
          <Revelar distancia="curta" atraso={360} naPrimeiraTela>
            {/*
              Duas montagens do mesmo nome. No computador, uma linha só, que
              atravessa a tela como o "NOIVAS" da referência. No celular, uma
              linha só daria letra de 40px; empilhado, o nome volta a ser
              cartaz. As montagens são `aria-hidden` e o nome é lido uma vez,
              pelo texto escondido.
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
      </div>
    </section>
  )
}
