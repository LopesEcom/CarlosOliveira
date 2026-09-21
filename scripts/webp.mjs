/**
 * Converte as imagens de public/ para WebP.
 *
 *   node scripts/webp.mjs           converte o que ainda não foi convertido
 *   node scripts/webp.mjs --forcar  reconverte tudo
 *
 * O que NÃO é convertido, de propósito:
 *
 *   og-image.jpg  — é a imagem de preview de link. Os robôs do WhatsApp, do
 *                   Facebook e do Instagram não leem WebP de forma
 *                   confiável; em WebP o preview sai sem imagem.
 *   favicon.png   — ícone de aba e de tela inicial. PNG é o formato que
 *                   todo navegador e todo sistema aceitam sem ressalva.
 *
 * Depois de rodar, atualize os caminhos nos arquivos de src/data/.
 */
import { readdir, stat, unlink } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

const RAIZ = path.resolve(import.meta.dirname, '..', 'public')
const CONVERSIVEIS = new Set(['.jpg', '.jpeg', '.png'])
const PRESERVAR = new Set(['og-image.jpg', 'favicon.png', 'apple-touch-icon.png'])

const forcar = process.argv.includes('--forcar')

/** Fotografia comprime melhor; arte com transparência precisa de menos perda. */
function opcoes(temAlfa) {
  return temAlfa
    ? { quality: 90, alphaQuality: 100, effort: 5 }
    : { quality: 82, effort: 5 }
}

async function listar(dir) {
  const entradas = await readdir(dir, { withFileTypes: true })
  const arquivos = []
  for (const e of entradas) {
    const caminho = path.join(dir, e.name)
    if (e.isDirectory()) arquivos.push(...(await listar(caminho)))
    else arquivos.push(caminho)
  }
  return arquivos
}

const arquivos = await listar(RAIZ)
let convertidos = 0
let antes = 0
let depois = 0

for (const origem of arquivos) {
  const ext = path.extname(origem).toLowerCase()
  const nome = path.basename(origem)

  if (!CONVERSIVEIS.has(ext)) continue
  if (PRESERVAR.has(nome)) {
    console.log(`preservado  ${path.relative(RAIZ, origem)}`)
    continue
  }

  const destino = origem.slice(0, -ext.length) + '.webp'

  if (!forcar) {
    try {
      await stat(destino)
      console.log(`já existe   ${path.relative(RAIZ, destino)}`)
      continue
    } catch {
      // não existe: converter
    }
  }

  const entrada = sharp(origem)
  const meta = await entrada.metadata()
  const tamanhoAntes = (await stat(origem)).size

  await entrada.webp(opcoes(Boolean(meta.hasAlpha))).toFile(destino)

  const tamanhoDepois = (await stat(destino)).size
  await unlink(origem)

  antes += tamanhoAntes
  depois += tamanhoDepois
  convertidos++

  const kb = (n) => Math.round(n / 1024)
  const queda = Math.round((1 - tamanhoDepois / tamanhoAntes) * 100)
  console.log(
    `convertido  ${path.relative(RAIZ, destino)}  ${kb(tamanhoAntes)}KB → ${kb(tamanhoDepois)}KB  (-${queda}%)`,
  )
}

const mb = (n) => (n / 1024 / 1024).toFixed(2)
console.log(
  `\n${convertidos} imagem(ns) convertida(s). ${mb(antes)} MB → ${mb(depois)} MB` +
    (antes > 0 ? ` (-${Math.round((1 - depois / antes) * 100)}%)` : ''),
)
