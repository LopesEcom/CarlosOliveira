import type { NextConfig } from 'next'

/**
 * As fotos que o Carlos envia pelo painel moram no Storage do Supabase. O
 * `next/image` só otimiza imagem de fora quando o domínio está liberado aqui,
 * e o domínio é o do projeto Supabase, lido da mesma variável que o site usa.
 * Sem a variável (antes de o Supabase existir) o site usa só as fotos de
 * public/, e a lista fica vazia.
 */
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
const hostSupabase = supabase ? new URL(supabase).hostname : null

const nextConfig: NextConfig = {
  // Há um package-lock.json na pasta do usuário, acima do projeto, e sem isto
  // o Next adivinha a raiz errada e reclama a cada build.
  turbopack: { root: process.cwd() },
  /*
   * OTIMIZAÇÃO DAS FOTOS
   * --------------------
   * AVIF primeiro (cerca de um terço menor que WebP nas fotos de madeira),
   * WebP para o navegador que não aceita. Cada combinação de foto, largura e
   * formato é gerada uma vez e fica guardada 30 dias: foto de peça não muda
   * de conteúdo sem mudar de nome (o painel sobe com nome novo).
   *
   * As listas de larguras são curtas de propósito. Com os valores padrão do
   * Next (oito larguras de tela e oito de miniatura) cada foto vira até
   * dezesseis arquivos, e cada um conta na cota de otimização da Vercel.
   * Estas cobrem o que o site mostra: miniaturas, cartões da grade, a foto
   * da peça e a capa em tela cheia.
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [96, 256, 384],
    remotePatterns: hostSupabase
      ? [{ protocol: 'https', hostname: hostSupabase, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
}

export default nextConfig
