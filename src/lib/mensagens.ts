import { SITE_URL } from './brand'
import { textoPreco } from './formato'
import { caminhoPeca } from './rotas'
import type { ItemSelecao } from './selecao'
import type { Peca } from './tipos'

/**
 * AS MENSAGENS QUE CHEGAM AO CARLOS.
 * ==================================
 *
 * Toda conversa que o site abre sai daqui. O número da peça vai sempre: é o
 * mesmo da etiqueta e da ficha de papel, e é com ele que o Carlos acha a
 * peça na prateleira entre trezentas. O link vai para quem recebe ver a foto
 * que a pessoa viu.
 */

export interface DadosDeQuemEscreve {
  nome?: string
  cidade?: string
  observacao?: string
}

/** "Nº 0002 · Coruja" */
export function identificacao(peca: Pick<Peca, 'numero' | 'nome'>): string {
  return `Nº ${peca.numero} · ${peca.nome}`
}

/**
 * Compra de uma peça, a partir do modelo das Configurações do painel
 * (`{peca}` e `{link}`), com a pergunta que cabe na situação dela.
 */
export function mensagemCompra(modelo: string, peca: Peca, quem: DadosDeQuemEscreve = {}): string {
  const link = `${SITE_URL}${caminhoPeca(peca)}`
  const abertura = modelo.replaceAll('{peca}', identificacao(peca)).replaceAll('{link}', link)
  const nome = quem.nome?.trim()
  const cidade = quem.cidade?.trim()
  const observacao = quem.observacao?.trim()

  const pergunta =
    peca.situacao !== 'a-venda'
      ? peca.aceitaEncomenda
        ? 'Ela não está disponível, mas você faria uma parecida para mim?'
        : 'Gostaria de saber mais sobre ela.'
      : peca.preco === null
        ? cidade
          ? 'Pode me passar medidas, valor e como fica a entrega?'
          : 'Ela ainda está disponível? Pode me passar medidas e valor?'
        : cidade
          ? 'Ela ainda está disponível? Como fica a entrega?'
          : 'Ela ainda está disponível?'

  return [
    abertura,
    '',
    ...(nome ? [`Aqui é ${nome}.`] : []),
    ...(cidade ? [`Sou de ${cidade}.`] : []),
    ...(observacao ? [observacao] : []),
    pergunta,
  ].join('\n')
}

/** Várias peças numa mensagem só: a barra da seleção. */
export function mensagemSelecao(itens: readonly ItemSelecao[], quem: DadosDeQuemEscreve = {}): string {
  const nome = quem.nome?.trim()
  const cidade = quem.cidade?.trim()
  const observacao = quem.observacao?.trim()

  return [
    nome ? `Olá, Carlos! Aqui é ${nome}. Vi o seu site e gostei destas peças:` : 'Olá, Carlos! Vi o seu site e gostei destas peças:',
    '',
    ...itens.map((item) => `• ${identificacao(item)}\n  ${SITE_URL}${caminhoPeca(item)}`),
    '',
    ...(cidade ? [`Sou de ${cidade}.`] : []),
    ...(observacao ? [observacao] : []),
    ...(cidade || observacao ? [''] : []),
    cidade ? 'Pode me passar medidas, valores e como fica a entrega?' : 'Pode me passar medidas e valores?',
  ].join('\n')
}

/** O que a seleção guarda de uma peça no momento em que ela é marcada. */
export function itemDaPeca(peca: Peca): ItemSelecao {
  return { slug: peca.slug, numero: peca.numero, nome: peca.nome, capa: peca.imagens[0] ?? null, preco: textoPreco(peca) }
}
