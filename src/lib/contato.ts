'use client'

import { createContext, useContext } from 'react'

import { CONFIGURACOES_PADRAO } from './dados/padrao'
import type { Configuracoes } from './tipos'

/**
 * O WhatsApp, o Instagram e a mensagem vêm do painel (Configurações), e
 * vários componentes do navegador precisam deles: a barra da seleção, o
 * formulário da escola, os botões. O layout do site lê uma vez no servidor e
 * entrega aqui.
 */
export const ContextoContato = createContext<Configuracoes>(CONFIGURACOES_PADRAO)

export function useConfiguracoes(): Configuracoes {
  return useContext(ContextoContato)
}
