export type CategoriaObra =
  | 'sacra'
  | 'fauna'
  | 'figura'
  | 'natureza'
  | 'utilitaria'

export interface Obra {
  slug: string
  /** Nome da peça. */
  nome: string
  categoria: CategoriaObra
  /**
   * A peça em uma linha curta: o que é e como foi resolvida.
   * Sem nome de madeira: as fotos não permitem afirmar a espécie, e chutar
   * "imbuia" ou "cedro" na descrição de uma peça entalhada à mão é pior do
   * que não dizer. Quando o Carlos revisar, é o campo a completar.
   */
  descricao: string
  /**
   * Caminhos servidos a partir de /public, por isso começam com "/".
   * Strings em /src/assets NÃO funcionam: o Vite só versiona esses arquivos
   * quando são importados como módulo. Para trocar as fotos, basta substituir
   * os arquivos em public/obras/ (ou apontar para uma URL externa).
   */
  imagens: string[]
  /** Entra no deslize horizontal, logo depois da oficina. */
  destaque?: boolean
}

/** Rótulos legíveis para filtros e trilhas. */
export const rotulosCategoria: Record<CategoriaObra, string> = {
  sacra: 'Arte sacra',
  fauna: 'Fauna',
  figura: 'Figura humana',
  natureza: 'Natureza',
  utilitaria: 'Utilitárias',
}

/**
 * Acervo publicado no site.
 *
 * É um recorte: o Carlos tem mais de 300 peças prontas, e o que está aqui são
 * as fotografadas até agora. Nomes e descrições foram escritos a partir das
 * fotos — vale o Carlos revisar peça por peça, principalmente para dizer a
 * madeira de cada uma e corrigir o nome das imagens sacras.
 */
export const obras: Obra[] = [
  /* ----------------------------------------------------------- arte sacra */
  {
    slug: 'cristo-coroa-de-espinhos',
    nome: 'Cristo, coroa de espinhos',
    categoria: 'sacra',
    descricao: 'Busto em madeira clara, cabelo e coroa entalhados a fundo',
    imagens: ['/obras/cristo-coroa-2.webp', '/obras/cristo-coroa-1.webp'],
    destaque: true,
  },
  {
    slug: 'face-de-cristo',
    nome: 'Face de Cristo',
    categoria: 'sacra',
    descricao: 'Coluna entalhada, traço estilizado e simétrico',
    imagens: ['/obras/face-de-cristo-2.webp', '/obras/face-de-cristo-1.webp'],
  },
  {
    slug: 'oratorio-gotico',
    nome: 'Oratório gótico',
    categoria: 'sacra',
    descricao: 'Capela de mesa com arcos ogivais, pináculos e imagem interna',
    imagens: ['/obras/oratorio-gotico-1.webp', '/obras/oratorio-gotico-2.webp'],
    destaque: true,
  },
  {
    slug: 'santa-ceia',
    nome: 'Santa Ceia',
    categoria: 'sacra',
    descricao: 'Painel em alto-relevo, treze figuras sobre parede de pedra',
    imagens: ['/obras/santa-ceia-1.webp', '/obras/santa-ceia-2.webp'],
    destaque: true,
  },
  {
    slug: 'santa-ceia-ornamentada',
    nome: 'Santa Ceia ornamentada',
    categoria: 'sacra',
    descricao: 'A mesma cena com moldura vazada de folhagem entalhada',
    imagens: [
      '/obras/santa-ceia-ornamentada-1.webp',
      '/obras/santa-ceia-ornamentada-2.webp',
    ],
  },
  {
    slug: 'santa-das-maos-postas',
    nome: 'Santa das mãos postas',
    categoria: 'sacra',
    descricao: 'Imagem de vulto em madeira clara, manto em pregas longas',
    imagens: ['/obras/santa-das-maos.webp'],
  },
  {
    slug: 'santa-do-manto',
    nome: 'Santa do manto',
    categoria: 'sacra',
    descricao: 'Imagem de vulto em madeira avermelhada, manto em torção',
    imagens: ['/obras/santa-do-manto.webp'],
  },
  {
    slug: 'nossa-senhora',
    nome: 'Nossa Senhora',
    categoria: 'sacra',
    descricao: 'Imagem de vulto sobre nuvens, mãos cruzadas ao peito',
    imagens: ['/obras/nossa-senhora.webp'],
  },

  /* ---------------------------------------------------------------- fauna */
  {
    slug: 'coruja',
    nome: 'Coruja',
    categoria: 'fauna',
    descricao: 'Peça de bancada, cada pena entalhada uma a uma',
    imagens: ['/obras/coruja-1.webp', '/obras/coruja-2.webp'],
    destaque: true,
  },
  {
    slug: 'aguia',
    nome: 'Águia',
    categoria: 'fauna',
    descricao: 'Asas abertas sobre base de tronco, tirada de um bloco só',
    imagens: ['/obras/aguia.webp'],
    destaque: true,
  },
  {
    slug: 'coruja-e-face',
    nome: 'Coruja e face',
    categoria: 'fauna',
    descricao: 'Duas leituras no mesmo bloco: a ave em cima, o rosto embaixo',
    imagens: ['/obras/coruja-e-face-1.webp', '/obras/coruja-e-face-2.webp'],
  },
  {
    slug: 'coruja-ao-luar',
    nome: 'Coruja ao luar',
    categoria: 'fauna',
    descricao: 'Painel em relevo, ave no galho e a lua cheia ao fundo',
    imagens: ['/obras/coruja-ao-luar.webp'],
  },
  {
    slug: 'peixes',
    nome: 'Peixes',
    categoria: 'fauna',
    descricao: 'Painel em relevo com cardume, juncos e superfície da água',
    imagens: ['/obras/peixes.webp'],
  },
  {
    slug: 'ave-estilizada',
    nome: 'Ave estilizada',
    categoria: 'fauna',
    descricao: 'Vulto alongado em madeira escura, bico e crista em lâmina',
    imagens: ['/obras/ave-estilizada.webp'],
  },
  {
    slug: 'serpente-e-espada',
    nome: 'Serpente e espada',
    categoria: 'fauna',
    descricao: 'Painel em relevo, corpo enrolado ao longo da lâmina',
    imagens: ['/obras/serpente-e-espada.webp'],
  },

  /* -------------------------------------------------------- figura humana */
  {
    slug: 'mulher-do-chapeu',
    nome: 'Mulher do chapéu',
    categoria: 'figura',
    descricao: 'Figura de vulto, vestido longo e mão na aba do chapéu',
    imagens: ['/obras/mulher-do-chapeu.webp'],
    destaque: true,
  },
  {
    slug: 'perfil-feminino',
    nome: 'Perfil feminino',
    categoria: 'figura',
    descricao: 'Baixo-relevo em painel, cabelo resolvido em ondas largas',
    imagens: ['/obras/perfil-feminino.webp'],
  },
  {
    slug: 'rosto-na-tora',
    nome: 'Rosto na tora',
    categoria: 'figura',
    descricao: 'Relevo aberto na tora com casca, aproveitando o nó da madeira',
    imagens: ['/obras/rosto-na-tora.webp'],
  },
  {
    slug: 'mascara',
    nome: 'Máscara',
    categoria: 'figura',
    descricao: 'Vulto frontal de traço geométrico, boca e olhos vazados',
    imagens: ['/obras/mascara-1.webp', '/obras/mascara-2.webp'],
  },
  {
    slug: 'figura-de-pe',
    nome: 'Figura de pé',
    categoria: 'figura',
    descricao: 'Vulto esguio em madeira escura, braço erguido e pano ao corpo',
    imagens: ['/obras/figura-de-pe.webp'],
  },
  {
    slug: 'figura-com-manto',
    nome: 'Figura com manto',
    categoria: 'figura',
    descricao: 'Vulto de pé com pano cruzado, entalhado em bloco único',
    imagens: ['/obras/figura-com-manto.webp'],
  },

  /* ------------------------------------------------------------- natureza */
  {
    slug: 'rosa',
    nome: 'Rosa',
    categoria: 'natureza',
    descricao: 'Flor aberta sobre haste, pétala por pétala, em base de tronco',
    imagens: ['/obras/rosa-1.webp', '/obras/rosa-2.webp'],
    destaque: true,
  },
  {
    slug: 'girassol',
    nome: 'Girassol',
    categoria: 'natureza',
    descricao: 'Painel em relevo, miolo trabalhado em grão fino',
    imagens: ['/obras/girassol.webp'],
  },
  {
    slug: 'lua',
    nome: 'Lua',
    categoria: 'natureza',
    descricao: 'Painel estreito em relevo, figura recostada no quarto crescente',
    imagens: ['/obras/lua.webp'],
  },

  /* ---------------------------------------------------------- utilitárias */
  {
    slug: 'relogio-dos-cavalos',
    nome: 'Relógio dos cavalos',
    categoria: 'utilitaria',
    descricao: 'Painel em alto-relevo com dois cavalos e mostrador ao centro',
    imagens: ['/obras/relogio-cavalos-1.webp', '/obras/relogio-cavalos-2.webp'],
    destaque: true,
  },
  {
    slug: 'relogio-cabeca-de-cavalo',
    nome: 'Relógio cabeça de cavalo',
    categoria: 'utilitaria',
    descricao: 'Peça de parede recortada, crina entalhada em mechas soltas',
    imagens: ['/obras/relogio-cabeca-de-cavalo.webp'],
  },
  {
    slug: 'relogio-de-parede',
    nome: 'Relógio de parede',
    categoria: 'utilitaria',
    descricao: 'Caixa vazada com volutas e coroamento entalhado',
    imagens: ['/obras/relogio-de-parede-1.webp', '/obras/relogio-de-parede-2.webp'],
  },
  {
    slug: 'moldura-de-folhagem',
    nome: 'Moldura de folhagem',
    categoria: 'utilitaria',
    descricao: 'Moldura vazada, folhas e volutas nos quatro cantos',
    imagens: ['/obras/moldura-folhagem-1.webp', '/obras/moldura-folhagem-2.webp'],
  },
  {
    slug: 'moldura-de-arabescos',
    nome: 'Moldura de arabescos',
    categoria: 'utilitaria',
    descricao: 'Moldura em madeira clara, desenho contínuo em toda a volta',
    imagens: ['/obras/moldura-arabesco-1.webp', '/obras/moldura-arabesco-2.webp'],
  },
  {
    slug: 'moldura-com-coroamento',
    nome: 'Moldura com coroamento',
    categoria: 'utilitaria',
    descricao: 'Moldura vazada com crista de folhagem acima do quadro',
    imagens: ['/obras/moldura-classica.webp'],
  },
  {
    slug: 'bau-entalhado',
    nome: 'Baú entalhado',
    categoria: 'utilitaria',
    descricao: 'Tampa abaulada, flores em relevo na frente e nas laterais',
    imagens: ['/obras/bau.webp'],
  },
]

/* -------------------------------------------------------------------------- */
/* Consultas                                                                   */
/* -------------------------------------------------------------------------- */

/** Ordem em que as categorias aparecem nos filtros e na vitrine. */
export const categoriasDisponiveis = Object.keys(rotulosCategoria) as CategoriaObra[]

export function obrasPorCategoria(categoria: CategoriaObra): Obra[] {
  return obras.filter((obra) => obra.categoria === categoria)
}

export function buscarObra(slug: string): Obra | undefined {
  return obras.find((obra) => obra.slug === slug)
}

export const obrasDestaque = obras.filter((obra) => obra.destaque)
