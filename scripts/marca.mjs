/**
 * A LOGO EM VERSÕES PARA O SITE.
 * ==============================
 *
 *   node scripts/marca.mjs
 *
 * O original é o brasão Artepira que o genro do Carlos fez
 * (marca/original/logo-artepira.png, já sem fundo). Este script recorta a
 * sobra transparente e gera:
 *
 *   public/marca/logo.png          o brasão colorido, para o fundo branco
 *   public/marca/logo-contraste.png    a versão em contraste, numa cor só, para
 *                                  a foto da capa e o rodapé escuro. Sobre
 *                                  a nogueira, o oval marrom do colorido
 *                                  some no fundo e o brasão vira uma mancha.
 *   public/icon.png                favicon, 192 px, transparente
 *   public/apple-touch-icon.png    180 px, sobre branco (o iPhone não aceita
 *                                  transparência: pinta de preto)
 *
 * O arquivo que veio pelo WhatsApp é pequeno (382 × 290 depois do recorte).
 * Se o genro mandar o original maior, troque o arquivo e rode de novo.
 *
 * A logo anterior (o selo de anéis com "CO") ficou em marca/antigo/.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

const RAIZ = path.resolve(import.meta.dirname, '..')
const em = (...p) => path.join(RAIZ, ...p)

const ORIGINAL = em('marca/original/logo-artepira.png')
const TRANSPARENTE = { r: 0, g: 0, b: 0, alpha: 0 }

await mkdir(em('public/marca'), { recursive: true })

const recortado = await sharp(ORIGINAL).trim().png({ compressionLevel: 9, effort: 10 }).toBuffer({ resolveWithObject: true })
await sharp(recortado.data).toFile(em('public/marca/logo.png'))
console.log('public/marca/logo.png', `${recortado.info.width}x${recortado.info.height}`)

/*
 * A VERSÃO EM CONTRASTE
 * ---------------------
 * A claridade de cada pixel vira a opacidade do creme: o que é claro no
 * brasão (as faixas, os formões, os arabescos) aparece, e o oval escuro
 * deixa ver o fundo. A faixa de 70 a 170 de claridade é o recorte que
 * deixou "ARTEPIRA" e "CARLOS ESCULTOR" nítidos sem apagar os ornamentos.
 */
const CREME = [245, 240, 231]
const CLARIDADE = { de: 70, ate: 170 }
{
  const { data, info } = await sharp(recortado.data).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixels = info.width * info.height
  const saida = Buffer.alloc(pixels * 4)
  for (let i = 0; i < pixels; i++) {
    const [r, g, b, a] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]]
    const claridade = 0.2126 * r + 0.7152 * g + 0.0722 * b
    const peso = Math.max(0, Math.min(1, (claridade - CLARIDADE.de) / (CLARIDADE.ate - CLARIDADE.de)))
    saida.set([...CREME, Math.round(peso * a)], i * 4)
  }
  await sharp(saida, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ palette: true, quality: 95, effort: 10, compressionLevel: 9 })
    .toFile(em('public/marca/logo-contraste.png'))
  console.log('public/marca/logo-contraste.png')
}

// Ícone quadrado com respiro: o brasão é oval e mais largo que alto.
const quadrado = async (lado, respiro, fundo, destino) => {
  const miolo = await sharp(recortado.data)
    .resize(lado - respiro * 2, lado - respiro * 2, { fit: 'contain', background: TRANSPARENTE })
    .toBuffer()
  await sharp({ create: { width: lado, height: lado, channels: 4, background: fundo } })
    .composite([{ input: miolo }])
    // Paleta de 256 cores: no tamanho de ícone a diferença não aparece, e o
    // arquivo cai a um terço.
    .png({ palette: true, quality: 95, effort: 10, compressionLevel: 9 })
    .toFile(em(destino))
  console.log(destino)
}
await quadrado(192, 4, TRANSPARENTE, 'public/icon.png')
await quadrado(180, 12, { r: 255, g: 255, b: 255, alpha: 1 }, 'public/apple-touch-icon.png')
