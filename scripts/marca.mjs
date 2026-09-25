/**
 * A LOGO EM VERSÕES PARA O SITE.
 * ==============================
 *
 *   node scripts/marca.mjs
 *
 * Os originais (marca/original/logo.png e favicon.png) vêm com fundo branco
 * chapado, e o cabeçalho do início fica sobre a foto escura da capa. Este
 * script tira o branco (a claridade de cada pixel vira transparência) e
 * pinta a marca nas duas cores do site:
 *
 *   public/marca/logo-tinta.png    marrom, para o fundo branco
 *   public/marca/logo-creme.png    creme, para a capa e o rodapé
 *   public/icon.png                favicon, 192 px, transparente
 *   public/apple-touch-icon.png    180 px, sobre branco (o iPhone não aceita
 *                                  transparência: pinta de preto)
 *
 * Rode de novo se a logo mudar.
 */
import path from 'node:path'

import sharp from 'sharp'

const RAIZ = path.resolve(import.meta.dirname, '..')
const em = (...p) => path.join(RAIZ, ...p)

const TINTA = { r: 42, g: 30, b: 21 }
const CREME = { r: 245, g: 240, b: 231 }

/** A marca como máscara: preto = marca, branco = fundo. Recortada rente. */
async function mascara(arquivo, largura) {
  const cinza = await sharp(em(arquivo)).flatten({ background: '#fff' }).grayscale().trim({ threshold: 20 }).resize({ width: largura, withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true })
  const { data, info } = cinza
  // Claridade invertida vira alfa, com um leve reforço para o fio fino
  // da letra não sair lavado.
  const alfa = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i++) alfa[i] = Math.min(255, Math.round((255 - data[i]) * 1.15))
  return { alfa, largura: info.width, altura: info.height }
}

async function pintar({ alfa, largura, altura }, cor, destino) {
  const rgba = Buffer.alloc(largura * altura * 4)
  for (let i = 0; i < largura * altura; i++) {
    rgba[i * 4] = cor.r
    rgba[i * 4 + 1] = cor.g
    rgba[i * 4 + 2] = cor.b
    rgba[i * 4 + 3] = alfa[i]
  }
  await sharp(rgba, { raw: { width: largura, height: altura, channels: 4 } }).png(PNG).toFile(em(destino))
  console.log(destino, `${largura}x${altura}`)
}

/*
 * TAMANHO E PESO
 * --------------
 * A logo aparece com no máximo 320 px de largura (no rodapé); 800 px cobre
 * tela de densidade 2,5. Maior que isso é peso que ninguém vê. E como cada
 * versão tem uma cor só, a paleta de 256 tons (com a transparência) guarda o
 * contorno sem perda visível e deixa o arquivo muitas vezes menor.
 */
const PNG = { palette: true, quality: 90, effort: 10, compressionLevel: 9 }

const logo = await mascara('marca/original/logo.png', 800)
await pintar(logo, TINTA, 'public/marca/logo-tinta.png')
await pintar(logo, CREME, 'public/marca/logo-creme.png')

// O símbolo só serve de miolo para os ícones: fica em marca/, fora do site.
const simbolo = await mascara('marca/original/favicon.png', 512)
await pintar(simbolo, TINTA, 'marca/simbolo-tinta.png')

// Favicon quadrado com respiro: o símbolo é redondo e encosta na borda.
const quadrado = async (lado, respiro, fundo, destino) => {
  const miolo = await sharp(em('marca/simbolo-tinta.png')).resize(lado - respiro * 2, lado - respiro * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  await sharp({ create: { width: lado, height: lado, channels: 4, background: fundo } }).composite([{ input: miolo }]).png(PNG).toFile(em(destino))
  console.log(destino)
}
await quadrado(192, 6, { r: 0, g: 0, b: 0, alpha: 0 }, 'public/icon.png')
await quadrado(180, 18, { r: 255, g: 255, b: 255, alpha: 1 }, 'public/apple-touch-icon.png')
