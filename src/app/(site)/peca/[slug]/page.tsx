import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import GradeObras from '../../../../components/GradeObras'
import Compra from '../../../../components/peca/Compra'
import FichaTecnica from '../../../../components/peca/FichaTecnica'
import Galeria from '../../../../components/peca/Galeria'
import Preco from '../../../../components/Preco'
import Revelar from '../../../../components/Revelar'
import { SITE_URL, brand } from '../../../../lib/brand'
import { relacionadas } from '../../../../lib/dados/acervo'
import { getColecoes, getPecaPorSlug, getPecas } from '../../../../lib/dados/consultas'
import { textoPreco } from '../../../../lib/formato'
import { caminhoPeca } from '../../../../lib/rotas'
import { podeComprar, rotulosSituacao, rotulosTema, type Peca } from '../../../../lib/tipos'

type Parametros = { params: Promise<{ slug: string }> }

/**
 * Uma página por peça publicada, gerada no build. Peça cadastrada depois pelo
 * painel também abre (`dynamicParams`), e fica guardada a partir da primeira
 * visita; o painel limpa o cache ao salvar.
 */
export async function generateStaticParams() {
  return (await getPecas()).map((p) => ({ slug: p.slug }))
}

export const dynamicParams = true

/**
 * O endereço traz o número e o nome: `/peca/0002-coruja`. Se a peça mudar de
 * nome, o endereço muda e o link antigo, que já circulou em conversa,
 * quebraria. Por isso endereço que não bate com peça nenhuma, mas começa com
 * um número que existe, redireciona para o endereço atual daquela peça.
 */
async function encontrar(slug: string): Promise<Peca> {
  const peca = await getPecaPorSlug(slug)
  if (peca) return peca
  const numero = /^\d{1,4}/.exec(slug)?.[0]?.padStart(4, '0')
  const mesma = numero ? (await getPecas()).find((p) => p.numero === numero) : undefined
  if (mesma) permanentRedirect(caminhoPeca(mesma))
  notFound()
}

/** Até uns 155 caracteres, que é o que o Google mostra. */
function descricao(peca: Peca): string {
  return [
    `${peca.descricao}.`,
    peca.madeira && `Em ${peca.madeira.toLowerCase()}.`,
    `Entalhada à mão por ${brand.nome}.`,
    podeComprar(peca) ? (textoPreco(peca) ?? 'Peça pronta, valor sob consulta.') : `${rotulosSituacao[peca.situacao]}.`,
  ]
    .filter(Boolean)
    .join(' ')
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const peca = await encontrar((await params).slug)
  const titulo = `${peca.nome}, Nº ${peca.numero}`
  const capa = peca.imagens[0]

  return {
    title: titulo,
    description: descricao(peca),
    alternates: { canonical: caminhoPeca(peca) },
    openGraph: {
      type: 'article',
      title: titulo,
      description: descricao(peca),
      url: caminhoPeca(peca),
      // A capa da peça no cartão do link do WhatsApp. É ela que faz o link de
      // uma peça chegar com a foto certa, e não com a do site.
      ...(capa ? { images: [{ url: capa, alt: `${peca.nome}, peça entalhada em madeira por ${brand.nome}` }] } : {}),
    },
  }
}

export default async function PaginaPeca({ params }: Parametros) {
  const peca = await encontrar((await params).slug)
  const [pecas, colecoes] = await Promise.all([getPecas(), getColecoes()])

  const posicao = pecas.findIndex((p) => p.id === peca.id)
  const anterior = posicao > 0 ? pecas[posicao - 1] : undefined
  const proxima = posicao >= 0 ? pecas[posicao + 1] : undefined

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados(peca)) }} />

      <div className="container-site pb-24 pt-8 md:pb-32 md:pt-10">
        <nav aria-label="Você está em">
          <ol className="rotulo flex flex-wrap items-center gap-x-2.5 gap-y-1 text-cinza">
            <li>
              <Link href="/acervo" className="transition-colors duration-300 ease-suave hover:text-tinta">
                Acervo
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/acervo?tema=${peca.tema}`} className="transition-colors duration-300 ease-suave hover:text-tinta">
                {rotulosTema[peca.tema]}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-tinta">
              {peca.nome}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Galeria peca={peca} />
          </div>

          <div className="lg:col-span-5">
            <Revelar distancia="curta">
              <div className="flex flex-wrap items-center gap-3">
                {peca.etiqueta && <span className="rotulo-sm bg-tinta px-2.5 py-1.5 text-creme">{peca.etiqueta}</span>}
                <span className="eyebrow">
                  Nº {peca.numero} · {rotulosTema[peca.tema]}
                </span>
              </div>
              <h1 className="mt-3 texto-display-sm">{peca.nome}</h1>
              {podeComprar(peca) ? (
                <Preco peca={peca} tamanho="grande" mostrarConsulta className="mt-4" />
              ) : (
                <p className="rotulo mt-4 inline-block bg-tinta px-2.5 py-1.5 text-creme">{rotulosSituacao[peca.situacao]}</p>
              )}
              <p className="mt-5 max-w-prose text-tinta/75">{peca.descricao}</p>
            </Revelar>

            <Revelar distancia="curta" atraso={100}>
              <div className="mt-8">
                <Compra peca={peca} />
              </div>
            </Revelar>

            <Revelar distancia="curta" atraso={160}>
              <div className="mt-12">
                <FichaTecnica peca={peca} colecoes={colecoes} />
              </div>
            </Revelar>

            {peca.historia && (
              <Revelar distancia="curta" atraso={200}>
                <h2 className="eyebrow mt-12">A história da peça</h2>
                <p className="t-italico mt-4">{peca.historia}</p>
              </Revelar>
            )}
          </div>
        </div>

        {/* ANTERIOR E PRÓXIMA: folhear o acervo sem voltar à lista. */}
        <nav aria-label="Outras peças do acervo" className="mt-20 grid grid-cols-2 gap-4 border-y border-borda md:mt-28">
          <div>
            {anterior && (
              <Link href={caminhoPeca(anterior)} className="group flex h-full items-center gap-3 py-5 pr-2">
                <ArrowLeft size={18} strokeWidth={1.5} aria-hidden className="shrink-0 transition-transform duration-300 ease-suave group-hover:-translate-x-1" />
                <span className="min-w-0">
                  <span className="rotulo block text-cinza">Anterior</span>
                  <span className="block truncate font-display text-h5">{anterior.nome}</span>
                </span>
              </Link>
            )}
          </div>
          <div>
            {proxima && (
              <Link href={caminhoPeca(proxima)} className="group flex h-full items-center justify-end gap-3 py-5 pl-2 text-right">
                <span className="min-w-0">
                  <span className="rotulo block text-cinza">Próxima</span>
                  <span className="block truncate font-display text-h5">{proxima.nome}</span>
                </span>
                <ArrowRight size={18} strokeWidth={1.5} aria-hidden className="shrink-0 transition-transform duration-300 ease-suave group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </nav>

        <section aria-labelledby="outras-pecas" className="mt-20 md:mt-28">
          <Revelar>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="eyebrow block">Do mesmo acervo</span>
                <h2 id="outras-pecas" className="mt-3 texto-display-sm">
                  Você também vai gostar
                </h2>
              </div>
              <Link href="/acervo" className="btn-contorno btn-sm">
                Ver o acervo
              </Link>
            </div>
          </Revelar>
          <GradeObras pecas={relacionadas(peca, pecas)} className="mt-12" />
        </section>
      </div>
    </>
  )
}

/**
 * A peça em JSON-LD como `VisualArtwork`, e não `Product`: é o tipo feito
 * para escultura, aceita autor, material e medidas, e não exige preço. A
 * oferta entra quando há valor publicado e a peça está à venda.
 */
function dadosEstruturados(peca: Peca): Record<string, unknown> {
  const url = `${SITE_URL}${caminhoPeca(peca)}`
  const absoluta = (src: string) => (src.startsWith('http') ? src : `${SITE_URL}${src}`)
  const medida = (valor: number | null) => (valor === null ? undefined : { '@type': 'Distance', name: `${valor} cm` })

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VisualArtwork',
        '@id': `${url}#peca`,
        url,
        name: peca.nome,
        description: peca.descricao,
        identifier: peca.numero,
        image: peca.imagens.map(absoluta),
        artform: 'Escultura',
        artMedium: peca.madeira ? `Madeira (${peca.madeira})` : 'Madeira',
        height: medida(peca.altura),
        width: medida(peca.largura),
        depth: medida(peca.profundidade),
        dateCreated: peca.ano ? String(peca.ano) : undefined,
        creator: { '@id': `${SITE_URL}/#carlos` },
        offers:
          podeComprar(peca) && peca.preco !== null
            ? {
                '@type': 'Offer',
                price: peca.preco,
                priceCurrency: 'BRL',
                availability: 'https://schema.org/InStock',
                url,
              }
            : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Acervo', item: `${SITE_URL}/acervo` },
          { '@type': 'ListItem', position: 2, name: peca.nome, item: url },
        ],
      },
    ],
  }
}
