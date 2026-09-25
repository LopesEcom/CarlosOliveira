import { createBrowserClient } from '@supabase/ssr'

import { supabaseAnonKey, supabaseUrl } from './env'

/** Cliente do navegador: só o envio de fotos do painel usa, direto para o Storage. */
export function clienteNavegador() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey())
}
