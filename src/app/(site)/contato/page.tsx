import Link from 'next/link'

import BotaoWhatsapp from '../../../components/BotaoWhatsapp'
import CabecalhoPagina from '../../../components/CabecalhoPagina'
import Faq from '../../../components/Faq'
import Revelar from '../../../components/Revelar'
import SecaoEncomenda from '../../../components/SecaoEncomenda'
import { IconeInstagram, IconeWhatsapp } from '../../../components/icones'
import { linkDoInstagram, linkWhatsApp } from '../../../lib/brand'
import { getConfiguracoes } from '../../../lib/dados/consultas'

export const metadata = { title: 'Contato', description: 'Fale com Carlos Oliveira pelo WhatsApp: peças prontas, encomendas, o livro e a escola de entalhadores.', alternates: { canonical: '/contato' } }

/**
 * Como uma compra acontece hoje. Não há carrinho: o site termina numa
 * conversa, e é nela que o resto se resolve.
 *
 * TODO (Etapa 0): pagamento, frete e retirada ainda não foram decididos. O
 * último passo diz só que isso é combinado na conversa, o que é verdade
 * qualquer que seja a decisão. Quando ela vier, o passo ganha os detalhes.
 */
const PASSOS = [
  {
    titulo: 'Escolha',
    texto: (
      <>
        Veja o <Link href="/acervo" className="underline decoration-borda underline-offset-4 hover:decoration-tinta">acervo</Link>{' '}
        e marque as peças de que gostou com o +.
      </>
    ),
  },
  { titulo: 'Mande', texto: 'A seleção vira uma mensagem pronta no WhatsApp, com o número e o link de cada peça.' },
  { titulo: 'Converse', texto: 'O Carlos responde com medidas, madeira e valor, e tira todas as suas dúvidas.' },
  { titulo: 'Combine', texto: 'Pagamento e entrega você combina direto com ele, na mesma conversa.' },
]

/**
 * CONTATO.
 * ========
 *
 * O WhatsApp é o único caminho (não há formulário nem e-mail publicado), e a
 * página não finge ter mais: um botão grande, o passo a passo de como uma
 * compra acontece, a encomenda e as dúvidas. Instagram e cidade aparecem
 * sozinhos quando o Carlos os preenche nas Configurações do painel.
 */
export default async function Contato() {
  const { contato } = await getConfiguracoes()
  const cidade = contato.cidade
  const linkInstagram = linkDoInstagram(contato.instagram)

  return (
    <>

      <CabecalhoPagina
        rotulo="Contato"
        titulo="Fale com o Carlos"
        italico="Tudo começa numa conversa."
      >
        <p>
          Quer uma peça pronta, uma encomenda, o livro ou saber da escola? Chame
          no WhatsApp. Quem responde é o próprio Carlos.
        </p>
      </CabecalhoPagina>

      <section className="border-t border-borda-sutil bg-branco">
        <div className="container-site secao-m">
          <div className="u-grid items-start">
            <div className="col-5">
              <Revelar>
                <BotaoWhatsapp
                  className="w-full sm:w-auto"
                  mensagem="Olá, Carlos! Vim pelo seu site e gostaria de conversar."
                >
                  Chamar no WhatsApp
                </BotaoWhatsapp>

                <ul className="mt-10 border-t border-borda text-sm">
                  <li className="border-b border-borda">
                    <a
                      href={linkWhatsApp(contato.whatsapp, 'Olá, Carlos! Vim pelo seu site.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 py-4 transition-colors duration-300 ease-suave hover:text-cinza"
                    >
                      <IconeWhatsapp width={20} height={20} />
                      <span>
                        <span className="block rotulo">WhatsApp</span>
                        {contato.whatsappExibicao && <span className="text-cinza">{contato.whatsappExibicao}</span>}
                      </span>
                    </a>
                  </li>
                  {linkInstagram && (
                    <li className="border-b border-borda">
                      <a
                        href={linkInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 py-4 transition-colors duration-300 ease-suave hover:text-cinza"
                      >
                        <IconeInstagram width={20} height={20} />
                        <span>
                          <span className="block rotulo">Instagram</span>
                          <span className="text-cinza">{contato.instagram}</span>
                        </span>
                      </a>
                    </li>
                  )}
                  {cidade && (
                    <li className="border-b border-borda py-4">
                      <span className="block rotulo">Oficina</span>
                      <span className="text-cinza">{cidade}</span>
                    </li>
                  )}
                </ul>
              </Revelar>
            </div>

            <div className="col-6 deslocar-7 mt-12 md:mt-0">
              <Revelar atraso={120}>
                <span className="eyebrow block">Como funciona a compra</span>
              </Revelar>
              <ol className="mt-6 grid gap-8">
                {PASSOS.map((passo, indice) => (
                  <Revelar
                    key={passo.titulo}
                    como="li"
                    atraso={160 + indice * 90}
                    className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-borda pt-5"
                  >
                    <span className="font-display text-[2.25rem] font-normal leading-none text-tinta/40">
                      {String(indice + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className="text-h5">{passo.titulo}</h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-tinta/70">{passo.texto}</p>
                    </div>
                  </Revelar>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <SecaoEncomenda />
      <Faq />
    </>
  )
}
