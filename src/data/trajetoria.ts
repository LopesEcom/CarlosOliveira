export interface EtapaTrajetoria {
  id: string
  /** Onde aconteceu. É o que ancora a etapa na memória de quem lê. */
  lugar: string
  titulo: string
  texto: string
}

/**
 * A trajetória do Carlos, na ordem em que aconteceu.
 *
 * TODO: faltam os anos. O Carlos contou os lugares e o tempo de São Paulo
 * (vinte anos no Bexiga), mas não as datas — e datar por conta seria inventar.
 * Assim que ele disser, entra um campo `periodo` em cada etapa e a seção passa
 * a mostrar a linha do tempo com os anos.
 */
export const trajetoria: EtapaTrajetoria[] = [
  {
    id: 'petropolis',
    lugar: 'Petrópolis, RJ',
    titulo: 'Onde aprendeu',
    texto:
      'Foi em Petrópolis que o Carlos aprendeu a entalhar — a segurar a goiva, a ler o veio da madeira e a descobrir que cada bloco só aceita ser aberto de um jeito.',
  },
  {
    id: 'bexiga',
    lugar: 'Bela Vista, São Paulo',
    titulo: 'Vinte anos no Bexiga',
    texto:
      'Duas décadas trabalhando no bairro do Bexiga, na Bela Vista. Foi ali que o ofício virou rotina de todo dia e que a mão ganhou a segurança que aparece nas peças de hoje.',
  },
  {
    id: 'cabo-frio',
    lugar: 'Cabo Frio, RJ',
    titulo: 'A loja',
    texto:
      'Em Cabo Frio teve loja própria, com as peças expostas para quem entrava. Do balcão para a bancada e da bancada para o balcão, sem intermediário entre quem fez e quem leva.',
  },
  {
    id: 'hoje',
    lugar: 'Hoje',
    titulo: 'Mais de 300 peças',
    texto:
      'O acervo passa de trezentas peças prontas, entre imagens sacras, fauna, figuras, relógios e molduras. Todas entalhadas à mão, uma a uma, e todas disponíveis.',
  },
]
