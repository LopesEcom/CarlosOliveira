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
 * tinha dito: vinte anos em São Paulo e a loja em Cabo Frio. Os áudios de
 * 25/09/2026 trouxeram as duas firmas de São Paulo (Rusalém e Arte Ziggo,
 * grafia a confirmar), o começo aos 13 anos, os 58 anos de bancada e as
 * milhares de peças que saíram dela para o Brasil e o exterior.
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
      'Começou a entalhar aos 13 anos. Chorou de saudade no degrau de uma calçada em Petrópolis, e foi lá que aprendeu o ofício que nunca mais largou.',
  },
  {
    id: 'bixiga',
    lugar: 'Bixiga, São Paulo',
    titulo: 'Mestre entalhador aos 21',
    texto:
      'Consagrado Mestre Entalhador no Bixiga aos 21 anos, passou vinte anos trabalhando em São Paulo, em duas firmas de entalhe: a Rusalém, na Bela Vista, e a Arte Ziggo, uma casa famosa, onde não entrava qualquer um.',
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
    titulo: 'Milhares de peças',
    texto:
      'São 58 anos de bancada e milhares de peças espalhadas pelo Brasil e pelo mundo. Por décadas, cada uma saiu direto para quem encomendou; as mais de trezentas do ateliê ele juntou depois de se aposentar. E, como ele mesmo diz: enquanto houver madeira e fôlego, o formão nunca irá parar.',
  },
]
