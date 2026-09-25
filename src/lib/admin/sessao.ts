import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

import { clienteServidor } from '../supabase/servidor'

/**
 * Exige sessão para ver a página do painel. Sem ela, manda para a entrada.
 *
 * O proxy já barra /admin, e isto é a segunda tranca: se a primeira for
 * contornada (já houve falha conhecida desse tipo no Next), as telas não
 * renderizam. Mora aqui, e não no layout, porque o layout também envolve a
 * tela de entrada, e redirecionar lá dentro faria um laço.
 */
export async function exigirSessao(): Promise<User> {
  const supabase = await clienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/entrar')
  return user
}
