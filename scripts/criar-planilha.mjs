/**
 * MIGRAÇÃO ÚNICA: o acervo que estava em src/data/obras.ts vira a planilha.
 * ========================================================================
 *
 *   node scripts/criar-planilha.mjs                 recusa se a planilha já existe
 *   node scripts/criar-planilha.mjs --sobrescrever  refaz do zero (APAGA edições)
 *   node scripts/criar-planilha.mjs --vazia         gera o modelo sem nenhuma peça
 *
 * Rodado em 2026-09-24 para criar `acervo/acervo.xlsx`. Desde então a fonte da
 * verdade é a planilha: este script só existe para gerar um modelo vazio de
 * novo, ou para refazer a migração se algo der muito errado.
 *
 * A NUMERAÇÃO
 * -----------
 * As dez peças do piloto de fotos (cartão 7 do guia, fotos/guia/) recebem de
 * 0001 a 0010, na mesma ordem do cartão. É o número que o Carlos escreve na
 * ficha de papel, e é por ele que a foto, a planilha e o site se encontram.
 * As demais peças já publicadas seguem de 0011 em diante. Peça nova: próximo
 * número livre.
 */
import { access, mkdir } from 'node:fs/promises'
import path from 'node:path'

import ExcelJS from 'exceljs'

const RAIZ = path.resolve(import.meta.dirname, '..')
const DESTINO = path.join(RAIZ, 'acervo', 'acervo.xlsx')
const SOBRESCREVER = process.argv.includes('--sobrescrever')
const VAZIA = process.argv.includes('--vazia')

/* ----------------------------------------------------- listas e colunas */

export const CATEGORIAS = ['Arte sacra', 'Fauna', 'Figura humana', 'Natureza', 'Utilitárias']
export const SITUACOES = ['À venda', 'Reservada', 'Vendida', 'Não está à venda']
export const MOSTRAR_PRECO = ['Não', 'Sim', 'A partir de']
export const SIM_NAO = ['Sim', 'Não']

/**
 * As colunas da aba Acervo, na ordem da ficha de papel: primeiro o que o
 * Carlos preenche à mão, depois o que é decisão de vitrine, por último o que
 * é interno. `chave` é o nome que o script de importação usa; mudar o TÍTULO
 * de uma coluna na planilha não quebra nada, mudar a ORDEM quebra.
 */
export const COLUNAS = [
  { chave: 'numero', titulo: 'Número', largura: 10, nota: 'Quatro dígitos, o mesmo da ficha de papel. Ex.: 0012.' },
  { chave: 'nome', titulo: 'Nome da peça', largura: 28 },
  { chave: 'categoria', titulo: 'Categoria', largura: 16, lista: CATEGORIAS },
  { chave: 'descricao', titulo: 'Descrição curta', largura: 48, nota: 'Uma linha. O que a peça é e como foi entalhada.' },
  { chave: 'madeira', titulo: 'Madeira', largura: 16 },
  { chave: 'altura', titulo: 'Altura (cm)', largura: 11 },
  { chave: 'largura', titulo: 'Largura (cm)', largura: 12 },
  { chave: 'profundidade', titulo: 'Fundura (cm)', largura: 12 },
  { chave: 'peso', titulo: 'Peso (kg)', largura: 10 },
  { chave: 'ano', titulo: 'Ano', largura: 8 },
  { chave: 'acabamento', titulo: 'Acabamento', largura: 18, nota: 'Ex.: cera, verniz fosco, natural, dourado.' },
  { chave: 'preco', titulo: 'Preço (R$)', largura: 12 },
  { chave: 'mostrarPreco', titulo: 'Mostrar preço', largura: 14, lista: MOSTRAR_PRECO, nota: 'Não: o site diz "sob consulta". A partir de: mostra "a partir de R$ …".' },
  { chave: 'situacao', titulo: 'Situação', largura: 17, lista: SITUACOES },
  { chave: 'aceitaEncomenda', titulo: 'Aceita encomenda parecida', largura: 14, lista: SIM_NAO },
  { chave: 'destaque', titulo: 'Destaque', largura: 10, lista: SIM_NAO, nota: 'Sim: entra no deslize da página inicial.' },
  { chave: 'colecoes', titulo: 'Coleções', largura: 26, nota: 'Códigos da aba Coleções, separados por vírgula.' },
  { chave: 'historia', titulo: 'História da peça', largura: 48, nota: 'Opcional. Duas ou três frases, de preferência nas palavras do Carlos.' },
  { chave: 'observacao', titulo: 'Observação interna', largura: 30, nota: 'NÃO aparece no site.' },
  { chave: 'fotosAntigas', titulo: 'Fotos antigas', largura: 40, nota: 'Arquivos de public/obras. Deixam de valer quando a pasta de fotos nova da peça existir.' },
]

export const COLECOES = [
  ['devocao', 'Devoção', 'Imagens sacras e oratórios.'],
  ['parede', 'Para a parede', 'Painéis em relevo, relógios e molduras.'],
  ['mesa-e-estante', 'Para a mesa e a estante', 'Esculturas de vulto, que ficam em pé.'],
]

/* ----------------------------------------------------------- migração */

/** Ordem do piloto de fotos: vira 0001 a 0010. `null` = peça nova, sem foto. */
const PILOTO = [
  null, // a bailarina premiada pelo Sebrae
  'coruja',
  'aguia',
  'cristo-coroa-de-espinhos',
  'nossa-senhora',
  'oratorio-gotico',
  'santa-ceia',
  'relogio-dos-cavalos',
  'bau-entalhado',
  'moldura-de-folhagem',
]

const PAREDE = new Set([
  'santa-ceia', 'santa-ceia-ornamentada', 'coruja-ao-luar', 'peixes', 'serpente-e-espada',
  'perfil-feminino', 'rosto-na-tora', 'girassol', 'lua', 'relogio-dos-cavalos',
  'relogio-cabeca-de-cavalo', 'relogio-de-parede', 'moldura-de-folhagem',
  'moldura-de-arabescos', 'moldura-com-coroamento',
])

const ROTULO_CATEGORIA = {
  sacra: 'Arte sacra',
  fauna: 'Fauna',
  figura: 'Figura humana',
  natureza: 'Natureza',
  utilitaria: 'Utilitárias',
}

async function linhasMigradas() {
  // Cópia do src/data/obras.ts de antes da planilha, guardada em acervo/. Só
  // tem dado e tipo: o Node 24 lê direto, tirando os tipos.
  const { obras } = await import(pathToFile(path.join(RAIZ, 'acervo/obras-legado.ts')))
  const porSlug = new Map(obras.map((o) => [o.slug, o]))
  const ordem = [...PILOTO, ...obras.map((o) => o.slug).filter((s) => !PILOTO.includes(s))]

  return ordem.map((slug, i) => {
    const numero = String(i + 1).padStart(4, '0')
    if (slug === null) {
      return {
        numero,
        nome: 'Bailarina',
        categoria: 'Figura humana',
        descricao: 'Premiada pelo Sebrae como a melhor peça da Região dos Lagos',
        mostrarPreco: 'Não',
        situacao: 'Não está à venda',
        aceitaEncomenda: 'Não',
        destaque: 'Sim',
        colecoes: 'mesa-e-estante',
        historia:
          'Para o Carlos, a bailarina é o maior símbolo da sua resiliência. Hoje ela repousa no ateliê.',
        observacao: 'Ainda sem foto. Confirmar com o Carlos se ela está à venda (o livro sugere que não).',
      }
    }
    const o = porSlug.get(slug)
    const colecoes = [
      o.categoria === 'sacra' && 'devocao',
      PAREDE.has(slug) ? 'parede' : o.categoria !== 'utilitaria' && 'mesa-e-estante',
    ].filter(Boolean)
    return {
      numero,
      nome: o.nome,
      categoria: ROTULO_CATEGORIA[o.categoria],
      descricao: o.descricao,
      mostrarPreco: 'Não',
      situacao: 'À venda',
      aceitaEncomenda: 'Sim',
      destaque: o.destaque ? 'Sim' : 'Não',
      colecoes: colecoes.join(', '),
      fotosAntigas: o.imagens.map((src) => path.basename(src, '.webp')).join(', '),
    }
  })
}

function pathToFile(caminho) {
  return new URL(`file:///${caminho.replaceAll('\\', '/')}`).href
}

/* ------------------------------------------------------------ planilha */

const TINTA = 'FF2A1E15'
const CREME = 'FFF5F0E7'

async function criar() {
  const livro = new ExcelJS.Workbook()
  livro.creator = 'Site Carlos Oliveira'

  const aba = livro.addWorksheet('Acervo', { views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] })
  aba.columns = COLUNAS.map((c) => ({ header: c.titulo, key: c.chave, width: c.largura }))

  const cabecalho = aba.getRow(1)
  cabecalho.height = 34
  cabecalho.eachCell((celula, n) => {
    celula.font = { bold: true, color: { argb: CREME } }
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TINTA } }
    celula.alignment = { vertical: 'middle', wrapText: true }
    const nota = COLUNAS[n - 1].nota
    if (nota) celula.note = nota
  })

  if (!VAZIA) {
    for (const linha of await linhasMigradas()) aba.addRow(linha)
  }

  // Número como TEXTO: senão o Excel come os zeros da frente (0012 vira 12).
  aba.getColumn('numero').numFmt = '@'

  // Listas de escolha nas colunas fechadas, até a linha 2000.
  COLUNAS.forEach((c, i) => {
    if (!c.lista) return
    const letra = aba.getColumn(i + 1).letter
    aba.dataValidations.add(`${letra}2:${letra}2000`, {
      type: 'list',
      allowBlank: true,
      formulae: [`"${c.lista.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Valor fora da lista',
      error: `Escolha um de: ${c.lista.join(', ')}`,
    })
  })
  aba.autoFilter = { from: 'A1', to: `${aba.getColumn(COLUNAS.length).letter}1` }

  const colecoes = livro.addWorksheet('Coleções')
  colecoes.columns = [
    { header: 'Código', key: 'id', width: 18 },
    { header: 'Nome', key: 'nome', width: 28 },
    { header: 'Descrição', key: 'descricao', width: 60 },
  ]
  colecoes.getRow(1).eachCell((c) => {
    c.font = { bold: true, color: { argb: CREME } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TINTA } }
  })
  for (const [id, nome, descricao] of COLECOES) colecoes.addRow({ id, nome, descricao })

  const ajuda = livro.addWorksheet('Como preencher')
  ajuda.getColumn(1).width = 110
  const TEXTO = [
    'COMO PREENCHER',
    '',
    'Uma linha por peça. O Número é o mesmo da ficha de papel e da pasta de fotos (ex.: 0012).',
    'Categoria, Mostrar preço, Situação, Aceita encomenda e Destaque têm lista: clique na célula e escolha.',
    'Medidas em centímetros, só o número (ex.: 32 ou 32,5). Peso em quilos.',
    'Preço só com números (ex.: 1200). Com "Mostrar preço" em Não, o site diz "sob consulta".',
    'Coleções: os códigos da aba Coleções, separados por vírgula (ex.: devocao, parede).',
    'Observação interna nunca aparece no site.',
    '',
    'DEPOIS DE SALVAR',
    '',
    'Na pasta do site, rode:   npm run acervo',
    'Ele lê esta planilha, confere tudo e avisa em acervo/relatorio.md o que estiver faltando ou errado.',
    'Peça sem nenhuma foto não entra no site, mas continua aqui, esperando a foto.',
    '',
    'NÃO MUDE A ORDEM DAS COLUNAS. Pode mudar o título, pode acrescentar linhas à vontade.',
  ]
  TEXTO.forEach((t, i) => {
    const c = ajuda.getCell(`A${i + 1}`)
    c.value = t
    if (/^[A-ZÇÃÕÉ ]+$/.test(t) && t) c.font = { bold: true, size: 13 }
  })

  await mkdir(path.dirname(DESTINO), { recursive: true })
  await livro.xlsx.writeFile(DESTINO)
  console.log(`Planilha criada: ${path.relative(RAIZ, DESTINO)}${VAZIA ? ' (vazia)' : ''}`)
}

/* ---------------------------------------------------------------- main */

if (import.meta.url === pathToFile(process.argv[1])) {
  let existe = false
  try {
    await access(DESTINO)
    existe = true
  } catch {}
  if (existe && !SOBRESCREVER) {
    console.log('A planilha já existe. Use --sobrescrever para refazer (APAGA o que foi editado nela).')
    process.exit(1)
  }
  await criar()
}
