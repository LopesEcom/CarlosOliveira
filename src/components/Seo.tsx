import { useLocation } from 'react-router-dom'

import { SITE_URL, TITULO_BASE } from '../lib/brand'

interface SeoProps {
  /** Omita na home para usar o título base puro. */
  titulo?: string
  descricao: string
  /** Caminho absoluto a partir da raiz, ex.: "/pecas/kelly-romantico-minimalista-e-contemporaneo.webp". */
  imagem?: string
  /**
   * Sobrescreve o caminho da URL canônica.
   *
   * Por padrão a canônica é o pathname, o que joga fora a query string. Isso
   * está certo para filtro que é só um recorte da mesma página, mas errado
   * para o catálogo por categoria: cada categoria tem título e descrição
   * próprios e é uma página de entrada legítima ("escultura de coruja em
   * madeira"). Sem este parâmetro, a canônica apontaria para /obras e o
   * Google descartaria a descrição da categoria.
   */
  caminho?: string
  /** Tira a página do índice. Use em erro e em qualquer rota sem conteúdo próprio. */
  naoIndexar?: boolean
  /** Dados estruturados da página, serializados em JSON-LD. */
  dadosEstruturados?: Record<string, unknown>
}

/**
 * Metadados por rota.
 *
 * O React 19 eleva `<title>` e `<meta>` para o <head> sozinho — por isso não há
 * react-helmet aqui. Vale saber do limite: isso roda no cliente, então serve ao
 * Google (que executa JS), mas NÃO aos robôs de preview do WhatsApp e do
 * Facebook, que não executam JS. As tags de Open Graph que eles leem são as
 * estáticas do index.html. Ver a nota sobre pré-renderização no README.
 */
export default function Seo({
  titulo,
  descricao,
  imagem = '/og-image.jpg',
  caminho,
  naoIndexar,
  dadosEstruturados,
}: SeoProps) {
  const { pathname } = useLocation()

  const tituloFinal = titulo ? `${titulo} | ${TITULO_BASE}` : TITULO_BASE
  const urlCanonica = `${SITE_URL}${caminho ?? pathname}`
  const urlImagem = `${SITE_URL}${imagem}`

  return (
    <>
      <title>{tituloFinal}</title>
      <meta name="description" content={descricao} />
      <link rel="canonical" href={urlCanonica} />
      {naoIndexar && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content="website" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content={TITULO_BASE} />
      <meta property="og:title" content={tituloFinal} />
      <meta property="og:description" content={descricao} />
      <meta property="og:url" content={urlCanonica} />
      <meta property="og:image" content={urlImagem} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={tituloFinal} />
      <meta name="twitter:description" content={descricao} />
      <meta name="twitter:image" content={urlImagem} />

      {dadosEstruturados && (
        <script
          type="application/ld+json"
          // O conteúdo é montado aqui a partir dos dados do site, nunca de
          // entrada externa, e JSON.stringify escapa o que vier dos textos.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
        />
      )}
    </>
  )
}
