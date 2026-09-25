'use server'

import { revalidatePath } from 'next/cache'

import { revalidarSite, type ResultadoAcao } from '../../../lib/admin/revalidar'
import { clienteServidor } from '../../../lib/supabase/servidor'
import type { Configuracoes } from '../../../lib/tipos'

/**
 * Salva o que o Carlos edita em Configurações: o WhatsApp para onde vão
 * todas as conversas do site, o Instagram, a cidade, e o começo da mensagem
 * de compra. Vale no site na hora.
 */
export async function salvarConfiguracoes(dados: Configuracoes): Promise<ResultadoAcao> {
  const whatsapp = dados.contato.whatsapp.replace(/\D/g, '')
  if (whatsapp.length < 12 || whatsapp.length > 13) {
    return { ok: false, erro: 'O WhatsApp precisa do código do país e do DDD. Ex.: 5522999998888.' }
  }
  if (!dados.mensagemPeca.includes('{peca}')) {
    return { ok: false, erro: 'A mensagem precisa conter {peca}, senão a pessoa chega sem dizer qual peça quer.' }
  }

  const instagram = dados.contato.instagram.trim()
  const supabase = await clienteServidor()
  const { error } = await supabase.from('configuracoes').upsert([
    {
      chave: 'contato',
      valor: {
        whatsapp,
        whatsappExibicao: dados.contato.whatsappExibicao.trim(),
        instagram: instagram && !instagram.startsWith('@') ? `@${instagram}` : instagram,
        email: dados.contato.email.trim(),
        cidade: dados.contato.cidade.trim(),
      },
    },
    { chave: 'mensagem', valor: { peca: dados.mensagemPeca.trim() } },
  ])
  if (error) return { ok: false, erro: 'Não foi possível salvar.' }

  revalidarSite('configuracoes')
  revalidatePath('/admin/configuracoes')
  return { ok: true }
}
