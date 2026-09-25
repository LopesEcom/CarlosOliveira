'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { clienteServidor } from '../../../lib/supabase/servidor'

export interface EstadoEntrada {
  erro?: string
}

/**
 * Entrada no painel.
 *
 * A mensagem de erro é sempre a mesma, sem distinguir "e-mail não existe" de
 * "senha errada": distinguir entregaria a um estranho quais e-mails têm
 * conta. Não existe cadastro pelo site: o acesso do Carlos é criado à mão no
 * Supabase (ver PAINEL.md).
 */
export async function entrar(_anterior: EstadoEntrada, dados: FormData): Promise<EstadoEntrada> {
  const email = String(dados.get('email') ?? '').trim()
  const senha = String(dados.get('senha') ?? '')
  if (!email || !senha) return { erro: 'Preencha o e-mail e a senha.' }

  const supabase = await clienteServidor()
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) return { erro: 'E-mail ou senha não conferem. Tente de novo.' }

  revalidatePath('/admin', 'layout')
  redirect('/admin')
}

export async function sair() {
  const supabase = await clienteServidor()
  await supabase.auth.signOut()
  revalidatePath('/admin', 'layout')
  redirect('/admin/entrar')
}
