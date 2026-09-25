export interface EtapaTrajetoria {
  id: string
  /** Onde aconteceu. É o que ancora a etapa na memória de quem lê. */
  lugar: string
  titulo: string
  texto: string
}

/**
 * A trajetória do Carlos, na ordem em que ele conta.
 *
 * Fonte: a introdução do livro dele, "O Silêncio da Madeira e o Grito da
 * Vida" (foto em imagens Carlos/livro-introducao.jpg), mais o que ele já
 * tinha dito: vinte anos em São Paulo e a loja em Cabo Frio.
 *
 * "Bixiga" com i, como ele escreve.
 *
 * TODO: a introdução não diz em que ordem vieram as feiras de Niterói e a
 * reforma do castelo em relação a Cabo Frio. A ordem abaixo é a do texto
 * dele; vale confirmar. Anos também ajudariam, e nenhum foi inventado.
 */
export const trajetoria: EtapaTrajetoria[] = [
  {
    id: 'infancia',
    lugar: 'Pavuna e Além Paraíba',
    titulo: 'O caçula do tupieiro',
    texto:
      'Nasceu na Pavuna e correu descalço no chão de terra batida de Além Paraíba. Do pai, tupieiro, herdou o talento que parecia impossível.',
  },
  {
    id: 'petropolis',
    lugar: 'Petrópolis, RJ',
    titulo: 'Onde aprendeu',
    texto:
      'Chorou de saudade no degrau de uma calçada em Petrópolis, e foi lá que aprendeu o ofício que nunca mais largou.',
  },
  {
    id: 'bixiga',
    lugar: 'Bixiga, São Paulo',
    titulo: 'Mestre entalhador aos 21',
    texto:
      'Consagrado Mestre Entalhador no Bixiga aos 21 anos, passou vinte anos trabalhando em São Paulo.',
  },
  {
    id: 'rio',
    lugar: 'Rio e Niterói',
    titulo: 'A estrada',
    texto:
      'Muita estrada num velho Gordini, madrugadas nas feiras de Niterói e a reforma de um castelo no Rio de Janeiro.',
  },
  {
    id: 'cabo-frio',
    lugar: 'Cabo Frio, Região dos Lagos',
    titulo: 'A bailarina',
    texto:
      'Teve loja própria em Cabo Frio. Lá, uma bailarina de madeira dele ganhou do Sebrae o prêmio de melhor peça da Região dos Lagos. Hoje ela é, para ele, o maior símbolo da própria resiliência.',
  },
  {
    id: 'hoje',
    lugar: 'Hoje',
    titulo: 'Mais de 300 peças',
    texto:
      'Aos 72 anos, são mais de trezentas peças. E, como ele mesmo diz: enquanto houver madeira e fôlego, o formão nunca irá parar.',
  },
]
