import { createClient } from '@supabase/supabase-js'

import { supabaseAnonKey, supabaseUrl } from './env'

/**
 * Leitura pública, sem sessão: tudo o que é vitrine.
 *
 * Sem cookie de propósito. O cliente com sessão lê `cookies()`, e isso faz o
 * Next renderizar a página a cada visita; sem ele, as páginas do site saem
 * estáticas e são refeitas quando o painel salva (ver lib/dados/cache.ts).
 */
export function clientePublico() {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
