/**
 * FOTOS DO ACERVO: da pasta crua ao site, sem retoque manual.
 * ===========================================================
 *
 *   npm run fotos                 processa as peças novas ou alteradas
 *   npm run fotos -- --forcar     refaz todas
 *   npm run fotos -- --so 0012    só uma peça (pelo número)
 *
 * ENTRADA
 * -------
 * Uma pasta por peça em `fotos/entrada/`, com o nome `<número>-<nome>`:
 *
 *   fotos/entrada/0001-bailarina/
 *   fotos/entrada/0002-coruja/
 *
 * Dentro, as fotos como vieram do celular, sem renomear. A ordem é a do nome
 * do arquivo, que no celular é a ordem em que foram tiradas: a primeira vira
 * a capa. Para forçar outra capa, ponha "capa" no começo do nome do arquivo.
 * A foto da ficha de papel NÃO entra na pasta: ela serve para transcrever os
 * dados e para separar uma peça da outra na galeria do celular.
 *
 * SAÍDA
 * -----
 *   public/acervo/<pasta>/capa-600.avif|webp, capa-1200.…   capa em 3:4
 *   public/acervo/<pasta>/01-640.avif|webp, 01-1280.…, 01-2000.…
 *   src/data/fotos.gerado.json    o manifesto que o site lê
 *   fotos/relatorio.md            o que precisa ser refotografado, e por quê
 *
 * AVIF e WebP juntos: AVIF é bem menor, WebP é a rede de segurança para o
 * navegador que ainda não lê AVIF. O site escolhe com <picture>.
 *
 * A CAPA SE ENQUADRA SOZINHA
 * --------------------------
 * Com o fundo neutro do guia, o script acha a peça pelo contraste com o fundo,
 * recorta com margem igual em todas e completa com a própria cor do fundo o
 * que faltar para chegar em 3:4. É isso que faz trezentas capas parecerem uma
 * coleção, e não trezentas fotos: a peça ocupa sempre a mesma proporção do
 * quadro, esteja ela perto ou longe do celular.
 *
 * Quando o fundo não é neutro (foto de oficina, como as antigas), não há como
 * separar peça de fundo com segurança: o recorte cai no enquadramento por
 * atenção do sharp, e o relatório avisa que a foto precisa ser refeita.
 */
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

const RAIZ = path.resolve(import.meta.dirname, '..')

/* ------------------------------------------------------------ argumentos */

const args = process.argv.slice(2)
function opcao(nome, padrao) {
  const i = args.indexOf(`--${nome}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : padrao
}

const FORCAR = args.includes('--forcar')
const SO = opcao('so', null)
// Os três abaixo existem para teste: apontam a entrada e a saída para outro
// lugar sem mexer no acervo de verdade.
const ENTRADA = path.resolve(RAIZ, opcao('entrada', 'fotos/entrada'))
const SAIDA = path.resolve(RAIZ, opcao('saida', 'public/acervo'))
const MANIFESTO = path.resolve(RAIZ, opcao('manifesto', 'src/data/fotos.gerado.json'))
const RELATORIO = path.resolve(RAIZ, opcao('relatorio', 'fotos/relatorio.md'))

/** Caminho público: o que vai no `src` do site, relativo a /public. */
const PREFIXO_PUBLICO = '/' + path.relative(path.join(RAIZ, 'public'), SAIDA).split(path.sep).join('/')

/* -------------------------------------------------------------- medidas */

const LARGURAS_CAPA = [600, 1200]
const LARGURAS_FOTO = [640, 1280, 2000]
const PROPORCAO_CAPA = 3 / 4

/** Quanto do quadro a peça ocupa na capa, no lado que encosta primeiro. */
const OCUPACAO = { altura: 0.8, largura: 0.78 }

const QUALIDADE = {
  // effort 3: metade do tempo do 5, e a diferença de tamanho não passa de 5%.
  avif: { quality: 55, effort: 3 },
  webp: { quality: 80, effort: 5 },
}

/**
 * Limites do controle de qualidade. Calibrados nas fotos que o Carlos já
 * mandou (ver o bloco de testes no README de fotos/): mexa com cuidado, cada
 * número aqui decide se uma foto volta para ele refazer.
 */
const LIMITE = {
  /** Lado maior abaixo disto é quase sempre foto que o WhatsApp comprimiu. */
  resolucao: 2400,
  /** Brilho médio do miolo da foto, de 0 a 255. */
  escura: 70,
  clara: 225,
  /** Fração de pixels estourados (quase brancos) na foto inteira. */
  estouro: 0.08,
  /**
   * Nitidez das regiões mais nítidas (ver `medirNitidez`). Nas fotos reais
   * do Carlos, as nítidas deram de 182 a 3664; as mesmas com desfoque leve
   * (σ 1,5) no máximo 74. O corte fica no meio, com folga para os dois lados.
   */
  tremida: 110,
  /** Variação máxima da cor ao longo da borda para o fundo contar como neutro. */
  fundoUniforme: 24,
  /** Diferença de cor que separa peça de fundo no recorte automático. */
  recorte: 38,
  fotosMinimas: 3,
}

const EXTENSOES = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff'])
const EXTENSOES_HEIC = new Set(['.heic', '.heif'])

/* ------------------------------------------------------------- utilidades */

const ordemNatural = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

function hex([r, g, b]) {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
}

async function existe(caminho) {
  try {
    await stat(caminho)
    return true
  } catch {
    return false
  }
}

async function lerJson(caminho, padrao) {
  try {
    return JSON.parse(await readFile(caminho, 'utf8'))
  } catch {
    return padrao
  }
}

/**
 * Estatísticas do que o pipeline PRODUZ.
 *
 * `.stats()` direto no pipeline mede a imagem de entrada e ignora recorte,
 * filtro e redimensionamento aplicados antes (comportamento do sharp 0.35).
 * Sem materializar, as três faixas de borda davam números idênticos e a
 * medida de nitidez media o contraste da foto inteira.
 */
async function estatisticas(pipeline) {
  return sharp(await pipeline.toBuffer()).stats()
}

/** Grava AVIF e WebP de um pipeline já redimensionado. */
async function gravarFormatos(pipeline, destinoSemExtensao) {
  await Promise.all([
    pipeline.clone().avif(QUALIDADE.avif).toFile(`${destinoSemExtensao}.avif`),
    pipeline.clone().webp(QUALIDADE.webp).toFile(`${destinoSemExtensao}.webp`),
  ])
}

/* ------------------------------------------------------ controle de qualidade */

/**
 * Nitidez da foto: variância do laplaciano, que acende nas bordas finas, e
 * foco nítido é muita borda fina.
 *
 * Medida por REGIÃO, e não na foto inteira. Numa foto com o fundo liso que o
 * guia pede, a maior parte do quadro não tem borda nenhuma, e a média da foto
 * inteira dava "tremida" para uma foto perfeita. Aqui a imagem vira uma grade
 * de 8x8 e vale o percentil 90 dos ladrilhos: as regiões mais nítidas, que é
 * onde está a peça. Tremida de verdade borra todos os ladrilhos juntos.
 */
function medirNitidez(data, largura, altura) {
  const GRADE = 8
  const lw = Math.floor(largura / GRADE)
  const lh = Math.floor(altura / GRADE)
  const variancias = []
  for (let gy = 0; gy < GRADE; gy++) {
    for (let gx = 0; gx < GRADE; gx++) {
      let s1 = 0
      let s2 = 0
      let m = 0
      for (let y = Math.max(1, gy * lh); y < Math.min(altura - 1, (gy + 1) * lh); y++) {
        for (let x = Math.max(1, gx * lw); x < Math.min(largura - 1, (gx + 1) * lw); x++) {
          const i = y * largura + x
          const lap = data[i - 1] + data[i + 1] + data[i - largura] + data[i + largura] - 4 * data[i]
          s1 += lap
          s2 += lap * lap
          m++
        }
      }
      if (m > 0) variancias.push(s2 / m - (s1 / m) ** 2)
    }
  }
  variancias.sort((a, b) => a - b)
  return variancias[Math.floor(variancias.length * 0.9)]
}

async function avaliarFoto(arquivo) {
  const avisos = []
  const base = sharp(arquivo).rotate()
  const meta = await base.metadata()
  const lado = Math.max(meta.width ?? 0, meta.height ?? 0)
  const nome = path.basename(arquivo)

  if (lado < LIMITE.resolucao) {
    avisos.push(`${nome}: resolução baixa (${lado} px). Provavelmente veio comprimida pelo WhatsApp: mandar como Documento.`)
  }

  // Tudo o mais é medido numa cópia pequena: rápido e estável entre celulares.
  const pequena = base.clone().resize({ width: 800, height: 800, fit: 'inside' }).greyscale()
  const { data, info } = await pequena.clone().raw().toBuffer({ resolveWithObject: true })

  let soma = 0
  let estourados = 0
  let n = 0
  const x0 = Math.floor(info.width * 0.25)
  const x1 = Math.floor(info.width * 0.75)
  const y0 = Math.floor(info.height * 0.25)
  const y1 = Math.floor(info.height * 0.75)
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const v = data[y * info.width + x]
      if (v >= 250) estourados++
      if (x >= x0 && x < x1 && y >= y0 && y < y1) {
        soma += v
        n++
      }
    }
  }
  const brilho = soma / n
  if (brilho < LIMITE.escura) avisos.push(`${nome}: escura. Mais luz na peça, ou aproximar da janela.`)
  if (brilho > LIMITE.clara) avisos.push(`${nome}: clara demais. Baixar a luz na tela do celular antes de fotografar.`)
  if (estourados / data.length > LIMITE.estouro) {
    avisos.push(`${nome}: fundo estourado (branco sem detalhe). Baixar a luz na tela do celular.`)
  }

  const nitidez = medirNitidez(data, info.width, info.height)
  if (nitidez < LIMITE.tremida) avisos.push(`${nome}: pode estar tremida ou fora de foco. Usar o temporizador.`)

  return { avisos, largura: meta.width, altura: meta.height, nitidez: Math.round(nitidez), brilho: Math.round(brilho) }
}

/* -------------------------------------------------------------- a capa */

/**
 * Cor do fundo e o quanto ele varia, medidos numa moldura fina em volta da
 * foto. A base (a mesa) fica de fora: é onde a peça encosta e onde cai a
 * sombra, e contaria como "fundo que varia" sem ser.
 */
async function medirFundo(imagem, largura, altura) {
  const faixa = Math.max(4, Math.round(Math.min(largura, altura) * 0.03))
  const regioes = [
    { left: 0, top: 0, width: largura, height: faixa },
    { left: 0, top: 0, width: faixa, height: Math.round(altura * 0.7) },
    { left: largura - faixa, top: 0, width: faixa, height: Math.round(altura * 0.7) },
  ]
  const medidas = await Promise.all(regioes.map((r) => estatisticas(imagem.clone().extract(r))))
  const media = [0, 1, 2].map((c) => medidas.reduce((s, m) => s + m.channels[c].mean, 0) / medidas.length)
  // Variação: o desvio dentro de cada faixa E a diferença entre as faixas.
  const desvioInterno = Math.max(...medidas.flatMap((m) => m.channels.slice(0, 3).map((ch) => ch.stdev)))
  const desvioEntre = Math.max(
    ...[0, 1, 2].map((c) => Math.max(...medidas.map((m) => Math.abs(m.channels[c].mean - media[c])))),
  )
  return { cor: media, variacao: Math.max(desvioInterno, desvioEntre) }
}

/**
 * Monta a capa 3:4. Devolve o pipeline pronto para redimensionar e como foi
 * enquadrada, que entra no manifesto e no relatório.
 */
async function montarCapa(arquivo) {
  const orientada = sharp(await sharp(arquivo).rotate().toBuffer())
  const { width: L, height: A } = await orientada.metadata()
  const fundo = await medirFundo(orientada, L, A)

  if (fundo.variacao <= LIMITE.fundoUniforme) {
    const { info } = await orientada
      .clone()
      .trim({ background: hex(fundo.cor), threshold: LIMITE.recorte })
      .toBuffer({ resolveWithObject: true })

    const peca = {
      x: -(info.trimOffsetLeft ?? 0),
      y: -(info.trimOffsetTop ?? 0),
      w: info.width,
      h: info.height,
    }
    const fracao = (peca.w * peca.h) / (L * A)

    // Recorte que achou quase nada ou quase tudo não achou a peça: cai no
    // enquadramento por atenção em vez de produzir uma capa torta.
    if (fracao > 0.02 && fracao < 0.9) {
      const quadroAltura = Math.max(peca.h / OCUPACAO.altura, peca.w / OCUPACAO.largura / PROPORCAO_CAPA)
      const quadroLargura = quadroAltura * PROPORCAO_CAPA
      const cx = peca.x + peca.w / 2
      const cy = peca.y + peca.h / 2

      const q = {
        x: Math.round(cx - quadroLargura / 2),
        y: Math.round(cy - quadroAltura / 2),
        w: Math.round(quadroLargura),
        h: Math.round(quadroAltura),
      }

      // O que cabe dentro da foto é recortado; o que passa da borda é
      // completado com a cor do fundo.
      const dentro = {
        left: Math.max(0, q.x),
        top: Math.max(0, q.y),
        width: Math.min(L, q.x + q.w) - Math.max(0, q.x),
        height: Math.min(A, q.y + q.h) - Math.max(0, q.y),
      }
      const falta = {
        left: Math.max(0, -q.x),
        top: Math.max(0, -q.y),
        right: Math.max(0, q.x + q.w - L),
        bottom: Math.max(0, q.y + q.h - A),
      }
      const [r, g, b] = fundo.cor.map(Math.round)
      const buffer = await orientada
        .clone()
        .extract(dentro)
        .extend({ ...falta, background: { r, g, b } })
        .toBuffer()

      return { pipeline: sharp(buffer), enquadramento: 'automatico', aviso: null }
    }
  }

  return {
    pipeline: orientada.clone().resize({
      width: 1200,
      height: 1600,
      fit: 'cover',
      position: sharp.strategy.attention,
    }),
    enquadramento: 'atencao',
    aviso: 'Capa sem fundo neutro: o enquadramento é aproximado. Refazer com o fundo cinza do guia.',
  }
}

/* ------------------------------------------------------------- uma peça */

async function processarPeca(pasta, anterior) {
  const [, numero, slug] = pasta.match(/^(\d+)-(.+)$/) ?? []
  const origem = path.join(ENTRADA, pasta)
  const todos = (await readdir(origem)).sort(ordemNatural.compare)

  const heic = todos.filter((f) => EXTENSOES_HEIC.has(path.extname(f).toLowerCase()))
  let fotos = todos.filter((f) => EXTENSOES.has(path.extname(f).toLowerCase()))
  // "capa…" vai para a frente; o resto mantém a ordem do celular.
  fotos = [...fotos.filter((f) => /^capa/i.test(f)), ...fotos.filter((f) => !/^capa/i.test(f))]

  const avisos = []
  if (!numero) avisos.push(`Nome da pasta fora do padrão "<número>-<nome>": ${pasta}`)
  if (heic.length) {
    avisos.push(
      `${heic.length} foto(s) em HEIC (formato do iPhone) ignorada(s). No iPhone: Ajustes > Câmera > Formatos > Mais compatível.`,
    )
  }
  if (fotos.length === 0) {
    return { pasta, numero, slug, fotos: [], avisos: [...avisos, 'Nenhuma foto na pasta.'], assinatura: null }
  }

  // Assinatura da entrada: nome, tamanho e data de cada arquivo. Se nada
  // mudou desde a última vez, a peça não é processada de novo.
  const detalhes = await Promise.all(fotos.map(async (f) => {
    const s = await stat(path.join(origem, f))
    return `${f}:${s.size}:${s.mtimeMs}`
  }))
  const assinatura = createHash('sha1').update(detalhes.join('|')).digest('hex').slice(0, 12)
  const destino = path.join(SAIDA, pasta)

  if (!FORCAR && anterior?.assinatura === assinatura && (await existe(destino))) {
    return { ...anterior, reaproveitada: true }
  }

  await rm(destino, { recursive: true, force: true })
  await mkdir(destino, { recursive: true })

  if (fotos.length < LIMITE.fotosMinimas) {
    avisos.push(`Só ${fotos.length} foto(s). O mínimo é ${LIMITE.fotosMinimas}: frente, lado e um detalhe.`)
  }

  // A capa.
  const capa = await montarCapa(path.join(origem, fotos[0]))
  if (capa.aviso) avisos.push(capa.aviso)
  for (const largura of LARGURAS_CAPA) {
    const altura = Math.round(largura / PROPORCAO_CAPA)
    await gravarFormatos(
      capa.pipeline.clone().resize({ width: largura, height: altura, fit: 'cover' }),
      path.join(destino, `capa-${largura}`),
    )
  }
  const miniatura = await capa.pipeline.clone().resize({ width: 16, height: 21, fit: 'cover' }).webp({ quality: 40 }).toBuffer()
  const { dominant } = await estatisticas(capa.pipeline.clone().resize({ width: 64 }))

  // Cada foto, na proporção original.
  const saidaFotos = []
  for (const [i, arquivo] of fotos.entries()) {
    const caminho = path.join(origem, arquivo)
    const avaliacao = await avaliarFoto(caminho)
    avisos.push(...avaliacao.avisos)

    const indice = String(i + 1).padStart(2, '0')
    const orientada = sharp(caminho).rotate()
    const larguras = LARGURAS_FOTO.filter((l) => l <= Math.max(avaliacao.largura, avaliacao.altura))
    if (larguras.length === 0) larguras.push(LARGURAS_FOTO[0])

    for (const largura of larguras) {
      await gravarFormatos(
        orientada.clone().resize({ width: largura, height: largura, fit: 'inside', withoutEnlargement: true }),
        path.join(destino, `${indice}-${largura}`),
      )
    }
    saidaFotos.push({
      base: `${PREFIXO_PUBLICO}/${pasta}/${indice}`,
      larguras,
      largura: avaliacao.largura,
      altura: avaliacao.altura,
      original: arquivo,
    })
  }

  return {
    pasta,
    numero,
    slug,
    assinatura,
    capa: {
      base: `${PREFIXO_PUBLICO}/${pasta}/capa`,
      larguras: LARGURAS_CAPA,
      lqip: `data:image/webp;base64,${miniatura.toString('base64')}`,
      cor: hex([dominant.r, dominant.g, dominant.b]),
      enquadramento: capa.enquadramento,
    },
    fotos: saidaFotos,
    avisos,
  }
}

/* --------------------------------------------------------------- relatório */

function montarRelatorio(pecas) {
  const comAviso = pecas.filter((p) => p.avisos.length > 0)
  const linhas = [
    '# Relatório das fotos',
    '',
    `Gerado em ${new Date().toLocaleString('pt-BR')}. ${pecas.length} peça(s), ${comAviso.length} com aviso.`,
    '',
    '| Peça | Fotos | Capa | Situação |',
    '| --- | --- | --- | --- |',
    ...pecas.map((p) =>
      `| ${p.pasta} | ${p.fotos.length} | ${p.capa?.enquadramento === 'automatico' ? 'automática' : 'aproximada'} | ${p.avisos.length ? `${p.avisos.length} aviso(s)` : 'pronta'} |`,
    ),
    '',
  ]
  for (const p of comAviso) {
    linhas.push(`## ${p.pasta}`, '', ...p.avisos.map((a) => `- ${a}`), '')
  }
  return linhas.join('\n')
}

/* ------------------------------------------------------------------ main */

if (!(await existe(ENTRADA))) {
  console.log(`Pasta de entrada não existe: ${path.relative(RAIZ, ENTRADA)}`)
  process.exit(0)
}

const anterior = await lerJson(MANIFESTO, { pecas: {} })
const pastas = (await readdir(ENTRADA, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name)
  .filter((nome) => !SO || nome.startsWith(`${SO}-`))
  .sort(ordemNatural.compare)

const resultado = []
for (const pasta of pastas) {
  process.stdout.write(`${pasta} … `)
  const peca = await processarPeca(pasta, anterior.pecas?.[pasta])
  resultado.push(peca)
  console.log(peca.reaproveitada ? 'sem mudança' : peca.avisos.length ? `${peca.avisos.length} aviso(s)` : 'pronta')
}

// Com --so, as outras peças continuam no manifesto como estavam.
const pecas = SO ? { ...anterior.pecas } : {}
for (const p of resultado) {
  const { reaproveitada: _, ...limpa } = p
  pecas[p.pasta] = limpa
}

await mkdir(path.dirname(MANIFESTO), { recursive: true })
await writeFile(
  MANIFESTO,
  JSON.stringify({ geradoEm: new Date().toISOString(), pecas }, null, 2) + '\n',
  'utf8',
)
await mkdir(path.dirname(RELATORIO), { recursive: true })
await writeFile(RELATORIO, montarRelatorio(Object.values(pecas)), 'utf8')

const total = Object.values(pecas)
console.log(
  `\n${total.length} peça(s) no manifesto, ${total.filter((p) => p.avisos.length).length} com aviso. ` +
    `Relatório em ${path.relative(RAIZ, RELATORIO)}.`,
)
