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
  images: {
    remotePatterns: hostSupabase
      ? [{ protocol: 'https', hostname: hostSupabase, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
}

export default nextConfig
