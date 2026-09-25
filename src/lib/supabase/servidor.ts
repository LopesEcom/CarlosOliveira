import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { supabaseAnonKey, supabaseUrl } from './env'

/**
 * Cliente com a sessão de quem está logado: o painel e as ações dele.
 *
 * Criado a cada requisição, nunca guardado em variável de módulo, porque
 * carrega os cookies de um usuário específico.
 */
export async function clienteServidor() {
  const loja = await cookies()

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => loja.getAll(),
      setAll(novos) {
        try {
          for (const { name, value, options } of novos) loja.set(name, value, options)
        } catch {
          /* Server Component não escreve cookie; a sessão é renovada no proxy. */
        }
      },
    },
  })
}
