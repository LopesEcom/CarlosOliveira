import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * A PORTA DO PAINEL.
 * ==================
 *
 * Tudo em /admin exige sessão do Supabase, menos a própria tela de entrada.
 * Além de barrar, renova o token a cada navegação: sem isso o Carlos seria
 * deslogado no meio do cadastro de uma peça.
 *
 * É a primeira tranca. A segunda é `exigirSessao()` em cada página do
 * painel (lib/admin/sessao.ts), para o caso de esta ser contornada.
 *
 * Sem Supabase configurado não há o que proteger: o painel mostra o que
 * falta configurar (ver src/app/admin/layout.tsx).
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chave) return NextResponse.next()

  const ehEntrada = request.nextUrl.pathname === '/admin/entrar'
  let resposta = NextResponse.next({ request })

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(novos) {
        for (const { name, value } of novos) request.cookies.set(name, value)
        resposta = NextResponse.next({ request })
        for (const { name, value, options } of novos) resposta.cookies.set(name, value, options)
      },
    },
  })

  // `getUser` valida o token no servidor do Supabase; `getSession` só lê o
  // cookie, e cookie dá para forjar.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !ehEntrada) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/admin/entrar'
    destino.search = ''
    return NextResponse.redirect(destino)
  }

  if (user && ehEntrada) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/admin'
    destino.search = ''
    return NextResponse.redirect(destino)
  }

  return resposta
}

export const config = {
  matcher: ['/admin/:path*'],
}
