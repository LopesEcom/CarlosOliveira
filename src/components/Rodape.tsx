import Link from 'next/link'

import { brand, linkDoInstagram, linkWhatsApp } from '../lib/brand'
import { menu } from '../lib/rotas'
import type { Configuracoes } from '../lib/tipos'
import Assinatura from './Assinatura'
import BotaoWhatsapp from './BotaoWhatsapp'
import Revelar from './Revelar'
import { IconeInstagram } from './icones'

/**
 * O FECHO e o rodapé, num bloco escuro só.
 *
 * O fecho não é um formulário: é uma pergunta em itálico e um botão. Quem
 * rolou até aqui já viu as peças; o que falta é o menor passo possível até a
 * conversa. A assinatura completa aparece aqui, uma vez, no fim da página,
 * como a assinatura de uma carta.
 *
 * Com o site em várias páginas, o rodapé também leva o menu: quem leu uma
 * página até o fim está exatamente no lugar de decidir para onde ir.
 */
export default function Rodape({ configuracoes }: { configuracoes: Configuracoes }) {
  const { contato } = configuracoes
  const linkInstagram = linkDoInstagram(contato.instagram)

  return (
    <footer className="bg-tinta text-creme">
      <div className="container-site secao-g flex flex-col items-center text-center">
        <Revelar>
          <span className="eyebrow block text-creme rebaixado">Próximo passo</span>
          <p className="t-italico-g mx-auto mt-6 max-w-[20ch] text-creme">
            Qual peça vai morar na sua casa?
          </p>
          <p className="mx-auto mt-7 max-w-md text-creme/70">
            Mande uma mensagem com o que você viu aqui ou com o que está procurando.
            O Carlos te responde com medidas, madeira e valor.
          </p>
          <BotaoWhatsapp
            variante="claro"
            className="mt-10"
            mensagem="Olá, Carlos! Vim pelo seu site e gostaria de conversar sobre uma peça."
          >
            Falar com o Carlos
          </BotaoWhatsapp>
        </Revelar>
      </div>

      <div className="border-t border-creme/15">
        <div className="container-site flex flex-col items-center gap-8 py-14 text-center">
          <Assinatura clara forma="bloco" />

          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-1">
              <li>
                <Link href="/" className="inline-block py-2.5 rotulo text-creme/80 transition-colors duration-300 ease-suave hover:text-creme">
                  Início
                </Link>
              </li>
              {menu.map((item) => (
                <li key={item.caminho}>
                  <Link
                    href={item.caminho}
                    className="inline-block py-2.5 rotulo text-creme/80 transition-colors duration-300 ease-suave hover:text-creme"
                  >
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <span aria-hidden className="h-px w-14 bg-creme/20" />

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-10">
            {linkInstagram && (
              <a
                href={linkInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 py-2.5 rotulo text-creme/80 transition-colors duration-300 ease-suave hover:text-creme"
              >
                <IconeInstagram width={18} height={18} />
                {contato.instagram}
              </a>
            )}
            <a
              href={linkWhatsApp(contato.whatsapp, 'Olá, Carlos! Vim pelo seu site.')}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 rotulo text-creme/80 transition-colors duration-300 ease-suave hover:text-creme"
            >
              WhatsApp
            </a>
          </div>

          {/* O ano sai do build no HTML pré-renderizado; na virada do ano o
              navegador corrige sem reclamar da diferença. */}
          <p suppressHydrationWarning className="text-xs tracking-wide text-creme/50">
            © {new Date().getFullYear()} {brand.nome}. Todas as peças entalhadas à mão.
          </p>
        </div>
      </div>
    </footer>
  )
}
