/**
 * ACERVO: da planilha ao site.
 * ============================
 *
 *   npm run acervo
 *
 * Lê `acervo/acervo.xlsx`, confere cada linha, junta com as fotos e grava
 * `src/data/acervo.gerado.json`, que é o que o site importa. O relatório do
 * que faltou ou está errado vai para `acervo/relatorio.md`.
 *
 * DE ONDE VÊM AS FOTOS DE CADA PEÇA
 * ---------------------------------
 * 1. Da pasta nova, processada pelo `npm run fotos` (src/data/fotos.gerado.json),
 *    encontrada pelo NÚMERO da peça. É o caminho de verdade: capa enquadrada,
 *    AVIF e WebP em vários tamanhos.
 * 2. Senão, da coluna "Fotos antigas": os arquivos de public/obras que vieram
 *    no WhatsApp antes do guia de fotos. Servem de ponte até a peça ser
 *    refotografada, e o relatório lista quais ainda estão assim.
 * 3. Sem nenhuma das duas, a peça NÃO entra no site. Continua na planilha,
 *    esperando a foto, e aparece no relatório.
 *
 * DEPOIS DO PAINEL
 * ----------------
 * Com o painel (Supabase) ligado, a fonte da verdade das peças passa a ser o
 * painel. A planilha continua servindo para a carga inicial (`npm run seed`
 * lê o JSON que sai daqui) e para o site funcionar sem Supabase.
 *
 * ERRO E AVISO
 * ------------
 * Erro tira a peça do site (número repetido, categoria que não existe, preço
 * para mostrar sem preço preenchido). Aviso deixa a peça entrar e só registra
 * (descrição vazia, medida que não é número, foto antiga).
 */
import { access, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import ExcelJS from 'exceljs'

import { COLUNAS } from './criar-planilha.mjs'

const RAIZ = path.resolve(import.meta.dirname, '..')

// As opções existem para teste: apontam entrada e saída para outro lugar sem
// mexer no acervo de verdade.
const args = process.argv.slice(2)
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`)
  return path.resolve(RAIZ, i >= 0 ? args[i + 1] : padrao)
}
const PLANILHA = opcao('planilha', 'acervo/acervo.xlsx')
const FOTOS = opcao('fotos', 'src/data/fotos.gerado.json')
const SAIDA = opcao('saida', 'src/data/acervo.gerado.json')
const RELATORIO = opcao('relatorio', 'acervo/relatorio.md')

/* --------------------------------------------------------- vocabulário */

/** Rótulo da planilha, e as palavras da ficha de papel, para o código do site. */
const CATEGORIA = {
  'arte sacra': 'sacra',
  sacra: 'sacra',
  fauna: 'fauna',
  bicho: 'fauna',
  'figura humana': 'figura',
  figura: 'figura',
  natureza: 'natureza',
  'utilitárias': 'utilitaria',
  'utilitaria': 'utilitaria',
  'relógio, moldura ou móvel': 'utilitaria',
}

const SITUACAO = {
  'à venda': 'a-venda',
  'a venda': 'a-venda',
  reservada: 'reservada',
  vendida: 'vendida',
  'não está à venda': 'fora-de-venda',
  'nao esta a venda': 'fora-de-venda',
}

const MODO_PRECO = { 'não': 'consulta', nao: 'consulta', sim: 'valor', 'a partir de': 'a-partir-de' }

/* ----------------------------------------------------------- leitura */

/** O valor de uma célula como texto, seja ela número, fórmula, link ou rich text. */
function texto(valor) {
  if (valor === null || valor === undefined) return ''
  if (typeof valor === 'object') {
    if ('richText' in valor) return valor.richText.map((p) => p.text).join('').trim()
    if ('result' in valor) return texto(valor.result)
    if ('text' in valor) return texto(valor.text)
    if (valor instanceof Date) return String(valor.getFullYear())
  }
  return String(valor).trim()
}

/** Número em formato brasileiro: "32,5", "1.200", "R$ 1.200,00". */
function numero(valor) {
  if (typeof valor === 'number') return valor
  const t = texto(valor).replace(/r\$\s*/i, '').replace(/\s/g, '')
  if (!t) return null
  const normal = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t
  const n = Number(normal)
  return Number.isFinite(n) ? n : NaN
}

const chave = (t) => texto(t).toLowerCase()

function slugificar(nome) {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function existe(caminho) {
  try {
    await access(caminho)
    return true
  } catch {
    return false
  }
}

/* -------------------------------------------------------------- fotos */

function fotosNovas(entrada) {
  const srcset = (base, larguras, ext) => larguras.map((l) => `${base}-${l}.${ext} ${l}w`).join(', ')
  const maior = (larguras) => larguras[larguras.length - 1]
  return {
    capa: {
      src: `${entrada.capa.base}-${maior(entrada.capa.larguras)}.webp`,
      srcsetWebp: srcset(entrada.capa.base, entrada.capa.larguras, 'webp'),
      srcsetAvif: srcset(entrada.capa.base, entrada.capa.larguras, 'avif'),
      lqip: entrada.capa.lqip,
      cor: entrada.capa.cor,
    },
    fotos: entrada.fotos.map((f) => ({
      src: `${f.base}-${maior(f.larguras)}.webp`,
      srcsetWebp: srcset(f.base, f.larguras, 'webp'),
      srcsetAvif: srcset(f.base, f.larguras, 'avif'),
      largura: f.largura,
      altura: f.altura,
    })),
    origem: 'nova',
  }
}

/* ---------------------------------------------------------------- main */

const livro = new ExcelJS.Workbook()
await livro.xlsx.readFile(PLANILHA)
const aba = livro.getWorksheet('Acervo')
if (!aba) throw new Error('A planilha não tem a aba "Acervo". Ela foi renomeada?')

const manifestoFotos = JSON.parse(await readFile(FOTOS, 'utf8').catch(() => '{"pecas":{}}'))
const fotosPorNumero = new Map(
  Object.values(manifestoFotos.pecas ?? {})
    .filter((p) => p.numero && p.fotos?.length)
    .map((p) => [p.numero.padStart(4, '0'), p]),
)

const colecoesDaPlanilha = []
livro.getWorksheet('Coleções')?.eachRow((linha, n) => {
  if (n === 1) return
  const [, id, nome, descricao] = linha.values
  if (texto(id)) colecoesDaPlanilha.push({ id: texto(id), nome: texto(nome), descricao: texto(descricao) })
})
const idsColecao = new Set(colecoesDaPlanilha.map((c) => c.id))

const pecas = []
const fora = []
const numerosVistos = new Map()
const avisosGerais = []

for (let n = 2; n <= aba.rowCount; n++) {
  const linha = aba.getRow(n)
  const bruto = Object.fromEntries(COLUNAS.map((c, i) => [c.chave, linha.getCell(i + 1).value]))
  if (COLUNAS.every((c) => !texto(bruto[c.chave]))) continue // linha vazia

  const erros = []
  const avisos = []

  // Número: aceita 12 ou "0012", guarda sempre com quatro dígitos.
  const numeroTexto = texto(bruto.numero).replace(/\D/g, '')
  const num = numeroTexto ? numeroTexto.padStart(4, '0') : ''
  if (!num) erros.push('sem número')
  else if (numerosVistos.has(num)) erros.push(`número repetido (também na linha ${numerosVistos.get(num)})`)
  else numerosVistos.set(num, n)

  const nome = texto(bruto.nome)
  if (!nome) erros.push('sem nome')

  const categoria = CATEGORIA[chave(bruto.categoria)]
  if (!categoria) erros.push(`categoria "${texto(bruto.categoria)}" não existe`)

  const situacao = SITUACAO[chave(bruto.situacao) || 'à venda']
  if (!situacao) erros.push(`situação "${texto(bruto.situacao)}" não existe`)

  const descricao = texto(bruto.descricao)
  if (!descricao) avisos.push('sem descrição curta')

  // Medidas e peso: número ou nada. Texto que não é número vira aviso.
  const medidas = {}
  for (const campo of ['altura', 'largura', 'profundidade']) {
    const v = numero(bruto[campo])
    if (Number.isNaN(v)) avisos.push(`${campo} "${texto(bruto[campo])}" não é número`)
    else if (v !== null) medidas[campo] = v
  }
  const peso = numero(bruto.peso)
  if (Number.isNaN(peso)) avisos.push(`peso "${texto(bruto.peso)}" não é número`)
  const ano = numero(bruto.ano)

  const valor = numero(bruto.preco)
  if (Number.isNaN(valor)) avisos.push(`preço "${texto(bruto.preco)}" não é número`)
  const modo = MODO_PRECO[chave(bruto.mostrarPreco) || 'não'] ?? 'consulta'
  if (modo !== 'consulta' && (valor === null || Number.isNaN(valor))) {
    erros.push('"Mostrar preço" está ligado, mas o preço está vazio ou inválido')
  }

  const colecoes = texto(bruto.colecoes).split(',').map((c) => c.trim()).filter(Boolean)
  for (const c of colecoes) if (!idsColecao.has(c)) avisos.push(`coleção "${c}" não existe na aba Coleções`)

  // Fotos: a pasta nova ganha da coluna antiga.
  let imagens = null
  const nova = num && fotosPorNumero.get(num)
  if (nova) {
    imagens = fotosNovas(nova)
    if (nova.avisos?.length) avisos.push(`fotos com ${nova.avisos.length} aviso(s) no relatório de fotos`)
  } else {
    const antigas = texto(bruto.fotosAntigas).split(',').map((f) => f.trim()).filter(Boolean)
    const caminhos = []
    for (const f of antigas) {
      const arquivo = f.includes('.') ? f : `${f}.webp`
      if (await existe(path.join(RAIZ, 'public', 'obras', arquivo))) caminhos.push(`/obras/${arquivo}`)
      else avisos.push(`foto antiga "${arquivo}" não existe em public/obras`)
    }
    if (caminhos.length) {
      imagens = {
        capa: { src: caminhos[0] },
        fotos: caminhos.map((src) => ({ src })),
        origem: 'antiga',
      }
      avisos.push('só fotos antigas, do WhatsApp: refotografar com o guia')
    }
  }
  if (!imagens) erros.push('sem foto: fica fora do site até a foto chegar')

  const registro = { linha: n, numero: num || '—', nome: nome || '(sem nome)', erros, avisos }
  if (erros.length) {
    fora.push(registro)
    continue
  }

  const slug = slugificar(nome)
  pecas.push({
    id: `${num}-${slug}`,
    numero: num,
    slug,
    nome,
    categoria,
    descricao,
    ...(texto(bruto.madeira) && { madeira: texto(bruto.madeira) }),
    ...(Object.keys(medidas).length && { medidas }),
    ...(peso !== null && !Number.isNaN(peso) && { peso }),
    ...(ano !== null && !Number.isNaN(ano) && { ano }),
    ...(texto(bruto.acabamento) && { acabamento: texto(bruto.acabamento) }),
    preco: { modo, valor: modo === 'consulta' ? null : valor },
    situacao,
    aceitaEncomenda: chave(bruto.aceitaEncomenda) !== 'não',
    destaque: chave(bruto.destaque) === 'sim',
    colecoes,
    ...(texto(bruto.historia) && { historia: texto(bruto.historia) }),
    capa: imagens.capa,
    fotos: imagens.fotos,
    origemFotos: imagens.origem,
  })
  if (avisos.length) fora.push({ ...registro, noSite: true })
}

// Pasta de fotos com número que não está na planilha: foto sem ficha.
for (const [num, p] of fotosPorNumero) {
  if (!numerosVistos.has(num)) avisosGerais.push(`Fotos da pasta "${p.pasta}" sem linha na planilha com o número ${num}.`)
}

await writeFile(
  SAIDA,
  JSON.stringify({ geradoEm: new Date().toISOString(), colecoes: colecoesDaPlanilha, pecas }, null, 2) + '\n',
  'utf8',
)

/* ---------------------------------------------------------- relatório */

const semSite = fora.filter((r) => !r.noSite)
const comAviso = fora.filter((r) => r.noSite)
const fotosAntigas = pecas.filter((p) => p.origemFotos === 'antiga').length

const md = [
  '# Relatório do acervo',
  '',
  `Gerado em ${new Date().toLocaleString('pt-BR')}.`,
  '',
  `- **${pecas.length}** peça(s) no site (${pecas.length - fotosAntigas} com fotos novas, ${fotosAntigas} ainda com fotos antigas)`,
  `- **${semSite.length}** peça(s) fora do site por erro ou falta de foto`,
  `- **${comAviso.length}** peça(s) no site com aviso`,
  '',
  ...(avisosGerais.length ? ['## Geral', '', ...avisosGerais.map((a) => `- ${a}`), ''] : []),
  ...(semSite.length
    ? ['## Fora do site', '', ...semSite.map((r) => `- **${r.numero} ${r.nome}** (linha ${r.linha}): ${r.erros.join('; ')}${r.avisos.length ? `. Avisos: ${r.avisos.join('; ')}` : ''}`), '']
    : []),
  ...(comAviso.length
    ? ['## No site, com aviso', '', ...comAviso.map((r) => `- **${r.numero} ${r.nome}**: ${r.avisos.join('; ')}`), '']
    : []),
].join('\n')
await writeFile(RELATORIO, md, 'utf8')

console.log(
  `${pecas.length} peça(s) no site, ${semSite.length} fora, ${comAviso.length} com aviso. ` +
    `Relatório em ${path.relative(RAIZ, RELATORIO)}.`,
)
