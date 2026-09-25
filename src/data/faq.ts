export interface Pergunta {
  id: string
  pergunta: string
  resposta: string
}

/**
 * Quatro perguntas — a FAQ aparece em todas as páginas, então precisa ser
 * curta.
 *
 * TODO: revise as respostas com o Carlos. Elas dizem o que já sabemos do
 * ofício dele, mas prazo de encomenda, frete e a forma de vender o livro
 * precisam ser os dele de verdade.
 */
export const perguntas: Pergunta[] = [
  {
    id: 'pecas-prontas',
    pergunta: 'As peças do site estão à venda?',
    resposta:
      'Sim. Tudo que está no acervo é peça pronta, entalhada e acabada. O site mostra só uma parte das mais de trezentas. Se você procura um tema que não está aqui, pergunte, porque pode ser que já exista.',
  },
  {
    id: 'encomenda',
    pergunta: 'Faz peça sob encomenda?',
    resposta:
      'Faz, sim. Uma imagem sacra, um painel do tamanho da sua parede, um relógio ou uma moldura com o desenho que você quiser. Mande a referência e as medidas do lugar onde a peça vai ficar, e o Carlos te diz o que dá para fazer e quanto tempo leva.',
  },
  {
    id: 'entalhe',
    pergunta: 'Como cada peça é feita?',
    resposta:
      'À mão, no formão, a partir de um bloco maciço. Nada de molde, resina ou peça colada. Por isso não existem duas iguais: mesmo quando o tema se repete, cada madeira tem um veio e pede outra solução.',
  },
  {
    id: 'livro',
    pergunta: 'Como consigo o livro e o manual de entalhes?',
    resposta:
      'O livro conta a vida do Carlos e traz, no fim, um manual de entalhe para quem quiser aprender. Chame ele no WhatsApp que ele te explica como conseguir o seu.',
  },
]
