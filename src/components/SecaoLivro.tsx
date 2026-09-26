import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { brand } from '../lib/brand'
import CapaLivro from './CapaLivro'
import Revelar from './Revelar'

/**
 * O que a capa da apostila diz dela. Só isso: o conteúdo de dentro mora num
 * link de fora que o site não lê, e inventar capítulos seria dizer pelo
 * Carlos o que ele não escreveu.
 */
const FICHA = [
  { titulo: '58 anos de profissão', texto: 'O que o Carlos aprendeu na bancada, desde Petrópolis.' },
  { titulo: 'Entalhe clássico', texto: 'Um ofício em extinção, registrado para não se perder.' },
  { titulo: 'Os mestres espanhóis', texto: 'O método de ensino dos mestres espanhóis de Petrópolis.' },
  { titulo: 'Livre e gratuita', texto: 'Volume 1, edição do mestre, aberta a quem quiser ler.' },
]

/**
 * Bloco 6, A APOSTILA.
 * ====================
 *
 * O bloco invertido da página, o pico de contraste, porque é o que o Carlos
 * tem de mais raro para dar: o método de um ofício que está sumindo, de
 * graça. A capa é a da apostila (ver CapaLivro) e o botão abre o material,
 * em outra aba, no endereço de `brand.livro.link`.
 *
 * A mesma seção é o início e a página /livro. Na página o título vira o h1;
 * no início ela também leva à página.
 */
export default function SecaoLivro({ comoPagina = false }: { comoPagina?: boolean }) {
  const Titulo = comoPagina ? 'h1' : 'h2'

  return (
    <section className="bg-tinta text-creme">
      <div className="container-site secao-g">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
          <Revelar distancia="nenhuma">
            <a
              href={brand.livro.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir a apostila ${brand.livro.titulo} (abre em outra aba)`}
              className="block transition-transform duration-500 ease-suave hover:-translate-y-1"
            >
              <CapaLivro className="mx-auto max-w-sm lg:max-w-md" />
            </a>
          </Revelar>

          <div>
            <Revelar atraso={80}>
              <span className="eyebrow block text-creme rebaixado">{brand.livro.escola}</span>
              <Titulo className="mt-4 texto-display text-creme">{brand.livro.titulo}</Titulo>
              <p className="t-italico mt-3 text-creme">{brand.livro.subtitulo}</p>
              <span className="filete-claro mt-8" />
            </Revelar>

            <Revelar atraso={160}>
              <div className="mt-8 max-w-xl space-y-5 text-creme/75">
                <p>
                  Na apostila, o Carlos reúne o jeito de entalhar que aprendeu com os
                  mestres espanhóis de Petrópolis, depois de 58 anos de profissão. É o
                  entalhe clássico, um ofício que está sumindo, escrito para quem quiser
                  aprender.
                </p>
                <p>A tiragem é livre e gratuita: é só abrir e ler.</p>
              </div>
            </Revelar>

            <ol className="mt-10 grid gap-x-8 gap-y-6 border-t border-creme/20 pt-8 sm:grid-cols-2">
              {FICHA.map((item, indice) => (
                <Revelar key={item.titulo} como="li" atraso={200 + indice * 80}>
                  <span className="font-display text-h6 text-creme rebaixado">
                    {String(indice + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 text-h5 text-creme">{item.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-creme/65">{item.texto}</p>
                </Revelar>
              ))}
            </ol>

            <Revelar atraso={300}>
              <div className="mt-12 flex flex-wrap gap-3">
                <a href={brand.livro.link} target="_blank" rel="noopener noreferrer" className="btn-secundario">
                  Acessar o material
                  <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
                </a>
                {!comoPagina && (
                  <Link href="/livro" className="btn-contorno-claro">
                    Sobre a apostila
                  </Link>
                )}
              </div>
              <p className="mt-4 text-xs text-creme/55">Abre em outra aba.</p>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  )
}
