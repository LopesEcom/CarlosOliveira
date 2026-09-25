import { brand } from '../brand'
import type { Configuracoes } from '../tipos'

/**
 * As configurações que valem sem Supabase, e para qualquer campo que o
 * Carlos ainda não tenha salvado no painel: o botão de WhatsApp nunca pode
 * sumir por causa de um campo vazio no banco.
 *
 * Arquivo à parte das consultas porque o navegador também precisa dele (ver
 * lib/contato.ts), e as consultas são código de servidor.
 */
export const CONFIGURACOES_PADRAO: Configuracoes = {
  contato: {
    whatsapp: brand.whatsapp,
    whatsappExibicao: brand.whatsappExibicao,
    instagram: brand.instagram,
    email: brand.email,
    cidade: brand.cidade,
  },
  mensagemPeca: 'Olá, Carlos! Vi no seu site a peça {peca} e tenho interesse.\n{link}',
}
