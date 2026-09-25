/**
 * GUIA DE FOTOS PARA O CARLOS
 * ===========================
 *
 *   node fotos/guia/gerar.mjs
 *
 * Gera, em fotos/guia/saida/:
 *
 *   01-capa.png … 07-piloto.png   cartões de 1080x1350 para mandar no WhatsApp
 *   ficha-da-peca.pdf             duas fichas por folha A4, para imprimir
 *   ficha-da-peca.png             a mesma folha, para ver no celular
 *
 * POR QUE CARTÕES, E NÃO UM LINK
 * ------------------------------
 * O Carlos tem 72 anos e recebe tudo pelo WhatsApp. Uma sequência de imagens
 * no formato retrato abre inteira na tela do celular, sem zoom, sem login e
 * sem clicar em nada, e fica guardada na conversa para ele voltar na hora de
 * fotografar. Por isso também a letra grande: nenhum texto abaixo de 34 px
 * num cartão de 1080.
 *
 * Os cartões são HTML renderizado pelo Microsoft Edge em modo headless, que
 * já vem no Windows. As fontes vêm do Google Fonts, então precisa de internet.
 */
import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const executar = promisify(execFile)

const AQUI = import.meta.dirname
const SAIDA = path.join(AQUI, 'saida')
const TEMP = path.join(AQUI, '.html')
const OBRAS = path.resolve(AQUI, '../../public/obras')

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]

const TOTAL = 7

/* ------------------------------------------------------------------ estilo */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..600&family=Instrument+Sans:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
html, body { margin: 0; }
body { width: 1080px; height: 1350px; background: #F5F0E7; color: #2A1E15; font-family: 'Instrument Sans', sans-serif; }
.cartao { width: 1080px; height: 1350px; padding: 84px 84px 72px; display: flex; flex-direction: column; }
.rotulo { font-size: 26px; letter-spacing: .2em; text-transform: uppercase; color: #6F6255; }
h1 { font-family: Fraunces, Georgia, serif; font-weight: 400; font-size: 74px; line-height: 1.04; margin: 22px 0 0; letter-spacing: -.005em; }
.filete { width: 90px; height: 3px; background: #2A1E15; margin: 34px 0 0; }
p, li { font-size: 36px; line-height: 1.4; }
.miolo { flex: 1; display: flex; flex-direction: column; margin-top: 44px; }
.rodape { display: flex; justify-content: space-between; align-items: center; padding-top: 28px; border-top: 2px solid #DDD5C7; font-size: 26px; color: #6F6255; }
.rodape b { font-family: Fraunces, Georgia, serif; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: #2A1E15; font-size: 24px; }
.item { display: flex; gap: 30px; align-items: flex-start; padding: 26px 0; border-bottom: 2px solid #E4DDD1; }
.item:last-child { border-bottom: 0; }
.item svg { flex-shrink: 0; }
.item strong { display: block; font-size: 38px; font-weight: 600; line-height: 1.25; }
.item span { display: block; font-size: 32px; line-height: 1.4; color: #4A3F35; margin-top: 6px; }
.nota { margin-top: auto; background: #FFFFFF; border-left: 6px solid #2A1E15; padding: 26px 30px; font-size: 32px; line-height: 1.4; color: #3A2E24; }
.destaque { background: #2A1E15; color: #F5F0E7; padding: 34px 36px; font-size: 38px; line-height: 1.35; }
.destaque b { font-weight: 600; }
`

function pagina(corpo, extraCss = '') {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}${extraCss}</style></head><body>${corpo}</body></html>`
}

function rodape(n) {
  return `<div class="rodape"><b>Carlos Oliveira</b><span>${n} de ${TOTAL}</span></div>`
}

/* ------------------------------------------------------------------ ícones */

const tinta = '#2A1E15'
const icone = (conteudo, tamanho = 76) =>
  `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 64 64" fill="none" stroke="${tinta}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${conteudo}</svg>`

const ICONES = {
  fundo: icone('<path d="M10 10 V36 Q10 50 24 50 H54" /><path d="M10 10 H54 V50" stroke-dasharray="3 5" />'),
  isopor: icone('<rect x="14" y="8" width="20" height="48" /><path d="M40 20 l12 -6 M40 32 h14 M40 44 l12 6" />'),
  tripe: icone('<rect x="24" y="6" width="16" height="26" rx="3" /><path d="M32 32 V40 M32 40 L18 58 M32 40 L46 58 M32 40 V58" />'),
  fita: icone('<circle cx="24" cy="30" r="14" /><circle cx="24" cy="30" r="6" /><path d="M36 38 L56 50 M42 22 l12 4" />'),
  ficha: icone('<rect x="12" y="8" width="40" height="48" /><path d="M20 20 h24 M20 30 h24 M20 40 h14" />'),
  lente: icone('<rect x="18" y="4" width="28" height="56" rx="5" /><circle cx="32" cy="18" r="6" />'),
  retrato: icone('<rect x="18" y="4" width="28" height="56" rx="5" /><path d="M26 50 h12" /><path d="M8 26 L14 32 L8 38" /><path d="M56 26 L50 32 L56 38" />'),
  altura: icone('<rect x="6" y="22" width="14" height="22" rx="3" /><path d="M20 33 H38" stroke-dasharray="3 4" /><path d="M46 12 C40 12 38 18 40 24 C36 30 38 46 40 52 H52 C54 46 56 30 52 24 C54 18 52 12 46 12 Z" />'),
  zoom: icone('<circle cx="28" cy="28" r="16" /><path d="M40 40 L56 56" /><path d="M20 28 h16" />'),
  foco: icone('<rect x="14" y="14" width="36" height="36" /><circle cx="32" cy="32" r="3" fill="' + tinta + '" /><path d="M32 4 v8 M32 52 v8 M4 32 h8 M52 32 h8" />'),
  relogio: icone('<circle cx="32" cy="34" r="22" /><path d="M32 22 V34 L40 40" /><path d="M24 6 h16" />'),
  pincel: icone('<path d="M44 6 L58 20 L30 48 L16 34 Z" /><path d="M16 34 C8 36 6 44 6 58 C20 58 28 56 30 48" />'),
  clipe: icone('<path d="M44 20 L24 40 a6 6 0 0 0 8 8 L52 28 a10 10 0 0 0 -14 -14 L16 36 a14 14 0 0 0 20 20 L50 42" />'),
  documento: icone('<path d="M16 6 H40 L50 16 V58 H16 Z" /><path d="M40 6 V16 H50" /><path d="M24 30 h18 M24 40 h18 M24 50 h10" />'),
  uma: icone('<rect x="10" y="10" width="44" height="44" /><path d="M26 24 l8 -6 V46" />'),
  iphone: icone('<rect x="18" y="4" width="28" height="56" rx="6" /><path d="M28 10 h8" /><circle cx="32" cy="32" r="8" /><path d="M32 22 v2 M32 40 v2 M22 32 h2 M40 32 h2" />'),
  conferir: icone('<circle cx="32" cy="32" r="24" /><path d="M20 32 L28 40 L44 24" />'),
}

/* ---------------------------------------------------- desenhos das 6 fotos */

// A mesma silhueta de peça em cada vista, para o Carlos reconhecer a
// sequência pelo desenho e não pelo texto.
const peca = (extra = '', transform = '') =>
  `<g transform="${transform}"><path d="M40 118 C34 96 36 70 44 54 C40 44 44 32 54 32 C64 32 68 44 64 54 C72 70 74 96 68 118 Z" fill="#C9A27A" stroke="${tinta}" stroke-width="3" />${extra}</g>`

const quadro = (conteudo) =>
  `<svg width="180" height="180" viewBox="0 0 108 150"><rect x="1.5" y="1.5" width="105" height="147" fill="#E9E3D8" stroke="${tinta}" stroke-width="3" />${conteudo}</svg>`

const VISTAS = {
  frente: quadro(peca('<circle cx="50" cy="44" r="2" fill="#2A1E15" /><circle cx="58" cy="44" r="2" fill="#2A1E15" />')),
  lado: quadro(peca('<circle cx="60" cy="44" r="2" fill="#2A1E15" /><path d="M56 60 C60 80 60 100 56 116" stroke="#2A1E15" stroke-width="2" fill="none" />', 'translate(4 0)')),
  costas: quadro(peca('<path d="M54 60 V112" stroke="#2A1E15" stroke-width="2" stroke-dasharray="4 5" />')),
  detalhe: quadro(`<circle cx="54" cy="70" r="40" fill="#C9A27A" stroke="${tinta}" stroke-width="3" /><path d="M34 60 q10 -10 20 0 t20 0 M34 74 q10 -10 20 0 t20 0 M34 88 q10 -10 20 0 t20 0" stroke="${tinta}" stroke-width="2.5" fill="none" />`),
  mao: quadro(peca('', 'translate(-14 0)') + `<path d="M76 120 V78 a4 4 0 0 1 8 0 V70 a4 4 0 0 1 8 0 V74 a4 4 0 0 1 8 0 V100 C100 112 94 120 84 120 Z" fill="#E9C9A8" stroke="${tinta}" stroke-width="3" />`),
  ficha: quadro(`<rect x="20" y="30" width="68" height="90" fill="#FFFFFF" stroke="${tinta}" stroke-width="3" /><path d="M30 48 h30 M30 62 h48 M30 76 h48 M30 90 h36 M30 104 h42" stroke="${tinta}" stroke-width="2.5" /><text x="72" y="52" font-family="Georgia" font-size="16" fill="${tinta}">Nº</text>`),
}

/* ------------------------------------------------------------------ cartões */

const cartoes = []

cartoes.push(['01-capa', pagina(`
<div class="cartao" style="background:#2A1E15;color:#F5F0E7">
  <span class="rotulo" style="color:#CBBFAF">Guia de fotos do acervo</span>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
    <h1 style="font-size:104px;color:#F5F0E7">Como fotografar as peças para o site</h1>
    <div class="filete" style="background:#F5F0E7"></div>
    <p style="font-size:42px;margin:40px 0 0;color:#E6DCCD;max-width:820px">Com o celular, uma janela e um fundo liso, as suas peças ficam com cara de catálogo.</p>
    <p style="font-size:42px;margin:26px 0 0;color:#E6DCCD">São seis passos.</p>
  </div>
  <div class="rodape" style="border-color:#4A3A2C;color:#CBBFAF"><b style="color:#F5F0E7">Carlos Oliveira</b><span>1 de ${TOTAL}</span></div>
</div>`)])

cartoes.push(['02-separar', pagina(`
<div class="cartao">
  <span class="rotulo">Passo 1</span>
  <h1>O que separar</h1>
  <div class="filete"></div>
  <div class="miolo" style="margin-top:20px">
    <div class="item">${ICONES.fundo}<div><strong>Fundo cinza-claro, fosco</strong><span>Papel ou cartolina grande, sem brilho, descendo da parede até a mesa numa curva só, sem dobra.</span></div></div>
    <div class="item">${ICONES.isopor}<div><strong>Duas placas de isopor branco</strong><span>Refletem a luz da janela e clareiam as sombras.</span></div></div>
    <div class="item">${ICONES.tripe}<div><strong>Suporte de celular</strong><span>Um tripé simples, ou uma pilha de livros. O celular precisa ficar parado.</span></div></div>
    <div class="item">${ICONES.pincel}<div><strong>Pincel macio, pano e fita crepe</strong><span>Para tirar o pó da peça e prender o fundo.</span></div></div>
    <div class="item">${ICONES.ficha}<div><strong>As fichas e uma caneta preta</strong><span>Uma ficha preenchida para cada peça.</span></div></div>
  </div>
  <div class="nota" style="margin:20px 0 32px">Para fotografar à noite: duas luminárias de LED de luz branca, a "luz do dia". Luz amarela deixa a madeira alaranjada.</div>
  ${rodape(2)}
</div>`)])

const DIAGRAMA_CIMA = `
<svg width="560" height="470" viewBox="0 0 560 470" font-family="Instrument Sans, sans-serif" font-size="22" fill="${tinta}">
  <path d="M40 30 H530" stroke="${tinta}" stroke-width="5" />
  <path d="M40 30 V440" stroke="${tinta}" stroke-width="5" />
  <rect x="30" y="110" width="20" height="170" fill="#FFFFFF" stroke="${tinta}" stroke-width="3" />
  <text x="62" y="102">janela</text>
  <path d="M60 150 L200 190 M60 195 L200 215 M60 240 L200 240" stroke="#C9A24A" stroke-width="4" stroke-dasharray="10 8" />
  <rect x="180" y="40" width="300" height="46" fill="#C6C1B8" />
  <rect x="160" y="86" width="340" height="230" fill="#EFE8DC" stroke="${tinta}" stroke-width="3" />
  <path d="M180 86 H480 V150 H180 Z" fill="#C6C1B8" opacity=".85" />
  <text x="215" y="72">fundo cinza</text>
  <text x="330" y="300">mesa</text>
  <circle cx="330" cy="200" r="30" fill="#C9A27A" stroke="${tinta}" stroke-width="3" />
  <rect x="515" y="130" width="16" height="150" fill="#FFFFFF" stroke="${tinta}" stroke-width="3" transform="rotate(-12 523 205)" />
  <text x="440" y="356">isopor</text>
  <rect x="312" y="380" width="36" height="22" rx="4" fill="${tinta}" />
  <path d="M330 402 L300 440 M330 402 L360 440 M330 402 V440" stroke="${tinta}" stroke-width="3" />
  <text x="378" y="400">celular</text>
</svg>`

const DIAGRAMA_LADO = `
<svg width="380" height="470" viewBox="0 0 380 470" font-family="Instrument Sans, sans-serif" font-size="22" fill="${tinta}">
  <path d="M60 30 V420 H350" stroke="${tinta}" stroke-width="5" fill="none" />
  <path d="M80 40 V250 Q80 320 150 320 H340" stroke="#A7A198" stroke-width="16" fill="none" />
  <rect x="80" y="328" width="270" height="18" fill="#EFE8DC" stroke="${tinta}" stroke-width="3" />
  <path d="M150 346 V420 M320 346 V420" stroke="${tinta}" stroke-width="3" />
  <path d="M215 318 C205 290 207 250 218 226 C212 214 217 196 230 196 C243 196 248 214 242 226 C253 250 255 290 245 318 Z" fill="#C9A27A" stroke="${tinta}" stroke-width="3" />
  <text x="96" y="80">fundo</text>
  <text x="96" y="106">em curva,</text>
  <text x="96" y="132">sem dobra</text>
</svg>`

cartoes.push(['03-montagem', pagina(`
<div class="cartao">
  <span class="rotulo">Passo 2</span>
  <h1>A montagem</h1>
  <div class="filete"></div>
  <div style="display:flex;gap:30px;margin-top:40px;align-items:flex-start">
    <div><p style="font-size:26px;letter-spacing:.14em;text-transform:uppercase;color:#6F6255;margin:0 0 10px">Visto de cima</p>${DIAGRAMA_CIMA}</div>
    <div><p style="font-size:26px;letter-spacing:.14em;text-transform:uppercase;color:#6F6255;margin:0 0 10px">Visto de lado</p>${DIAGRAMA_LADO}</div>
  </div>
  <div class="miolo" style="margin-top:24px">
    <div class="item" style="padding:20px 0"><div><strong>A janela fica ao lado da peça</strong><span>Nunca atrás dela, nem atrás do celular.</span></div></div>
    <div class="item" style="padding:20px 0"><div><strong>Sem sol batendo direto</strong><span>Dia nublado, ou janela sem sol, é o ideal.</span></div></div>
    <div class="item" style="padding:20px 0"><div><strong>Apague a luz do teto</strong><span>Ela amarela a foto.</span></div></div>
  </div>
  ${rodape(3)}
</div>`)])

cartoes.push(['04-celular', pagina(`
<div class="cartao">
  <span class="rotulo">Passo 3</span>
  <h1>O celular</h1>
  <div class="filete"></div>
  <div class="miolo" style="margin-top:14px">
    <div class="item">${ICONES.lente}<div><strong>Limpe a lente</strong><span>Com a camisa mesmo. Lente com gordura deixa tudo embaçado.</span></div></div>
    <div class="item">${ICONES.retrato}<div><strong>Modo Foto, celular em pé</strong><span>Não use o modo Retrato: ele borra as bordas do entalhe.</span></div></div>
    <div class="item">${ICONES.altura}<div><strong>Na altura do meio da peça</strong><span>Não fotografe de cima para baixo.</span></div></div>
    <div class="item">${ICONES.zoom}<div><strong>Sem zoom com os dedos</strong><span>Se precisar, chegue o celular mais perto.</span></div></div>
    <div class="item">${ICONES.foco}<div><strong>Toque na peça, na tela</strong><span>Isso foca. Se o fundo ficar branco demais, arraste o solzinho para baixo.</span></div></div>
    <div class="item">${ICONES.relogio}<div><strong>Temporizador de 3 segundos</strong><span>Assim a foto não treme.</span></div></div>
  </div>
  ${rodape(4)}
</div>`, '.item{padding:14px 0;gap:26px}.item svg{width:64px;height:64px}.item strong{font-size:36px}.item span{font-size:29px;margin-top:4px}.cartao h1{margin-top:16px}')])

const quadroFoto = (n, desenho, titulo, texto) => `
<div style="display:flex;flex-direction:column;gap:12px">
  <div style="position:relative">${desenho}<span style="position:absolute;top:-14px;left:-14px;min-width:54px;height:54px;padding:0 14px;border-radius:27px;background:${tinta};color:#F5F0E7;display:flex;align-items:center;justify-content:center;font-family:Fraunces,Georgia,serif;font-size:30px;white-space:nowrap">${n}</span></div>
  <strong style="font-size:32px;line-height:1.2">${titulo}</strong>
  <span style="font-size:27px;line-height:1.35;color:#4A3F35">${texto}</span>
</div>`

cartoes.push(['05-seis-fotos', pagina(`
<div class="cartao">
  <span class="rotulo">Passo 4</span>
  <h1>A ficha, e seis fotos de cada peça</h1>
  <div class="filete"></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:34px 34px;margin-top:46px">
    ${quadroFoto('0', VISTAS.ficha, 'A ficha', 'Preenchida, sempre antes da peça.')}
    ${quadroFoto('1', VISTAS.frente, 'De frente', 'A peça inteira, com espaço em volta.')}
    ${quadroFoto('2', VISTAS.lado, 'De lado', 'Gire a peça um pouco.')}
    ${quadroFoto('3', VISTAS.costas, 'De costas', 'A parte de trás também vende.')}
    ${quadroFoto('4 e 5', VISTAS.detalhe, 'Dois detalhes', 'De perto: rosto, penas, textura.')}
    ${quadroFoto('6', VISTAS.mao, 'Com a sua mão', 'Ao lado da peça: mostra o tamanho.')}
  </div>
  <div class="nota" style="margin:36px 0 32px">Deixe sobrar espaço em volta da peça na foto de frente: o site recorta sozinho e deixa todas do mesmo tamanho.</div>
  ${rodape(5)}
</div>`, '.cartao h1{font-size:68px}')])

cartoes.push(['06-mandar', pagina(`
<div class="cartao">
  <span class="rotulo">Passo 5</span>
  <h1>Como mandar as fotos</h1>
  <div class="filete"></div>
  <div class="destaque" style="margin-top:44px">No WhatsApp, mande como <b>Documento</b>, e não como foto.</div>
  <p style="font-size:32px;color:#4A3F35;margin:22px 0 0">Como foto, o WhatsApp diminui a imagem e ela perde a nitidez. Como documento, ela chega do jeito que saiu do celular.</p>
  <div class="miolo" style="margin-top:18px">
    <div class="item">${ICONES.clipe}<div><strong>Toque no clipe e em Documento</strong><span>Depois escolha as fotos daquela peça.</span></div></div>
    <div class="item">${ICONES.uma}<div><strong>Uma peça de cada vez</strong><span>A foto da ficha primeiro, depois as seis fotos.</span></div></div>
    <div class="item">${ICONES.iphone}<div><strong>Se o celular for iPhone</strong><span>Ajustes, Câmera, Formatos: marque "Mais compatível".</span></div></div>
    <div class="item">${ICONES.conferir}<div><strong>A gente confere e avisa</strong><span>Se alguma foto precisar ser refeita, você fica sabendo qual e por quê.</span></div></div>
  </div>
  ${rodape(6)}
</div>`, '.item{padding:14px 0;gap:26px}.item svg{width:64px;height:64px}.item strong{font-size:36px}.item span{font-size:29px;margin-top:4px}.destaque{padding:26px 32px}')])

const PILOTO = [
  ['A bailarina', null],
  ['Coruja', 'coruja-1'],
  ['Águia', 'aguia'],
  ['Cristo', 'cristo-coroa-2'],
  ['Nossa Senhora', 'nossa-senhora'],
  ['Oratório gótico', 'oratorio-gotico-1'],
  ['Santa Ceia', 'santa-ceia-1'],
  ['Relógio dos cavalos', 'relogio-cavalos-1'],
  ['Baú entalhado', 'bau'],
  ['Moldura de folhagem', 'moldura-folhagem-1'],
]

const miniatura = ([nome, arquivo], i) => `
<div style="display:flex;flex-direction:column;gap:10px">
  <div style="position:relative;width:170px;height:226px;background:#E4DDD1;overflow:hidden">
    ${arquivo
      ? `<img src="${pathToFileURL(path.join(OBRAS, `${arquivo}.webp`)).href}" style="width:100%;height:100%;object-fit:cover">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:14px;font-family:Fraunces,Georgia,serif;font-size:24px;line-height:1.2;color:#4A3F35;background:#EFE8DC;border:3px dashed #B9AE9E">a premiada pelo Sebrae</div>`}
    <span style="position:absolute;top:8px;left:8px;min-width:40px;height:40px;padding:0 8px;background:${tinta};color:#F5F0E7;display:flex;align-items:center;justify-content:center;font-family:Fraunces,Georgia,serif;font-size:22px">Nº ${String(i + 1).padStart(4, '0')}</span>
  </div>
  <span style="font-size:24px;line-height:1.2;font-weight:600">${nome}</span>
</div>`

cartoes.push(['07-piloto', pagina(`
<div class="cartao">
  <span class="rotulo">Passo 6</span>
  <h1>Comece por estas dez</h1>
  <div class="filete"></div>
  <p style="font-size:32px;color:#4A3F35;margin:26px 0 0">São as mais difíceis de fotografar: altas, largas, escuras, douradas e vazadas. O número de cada uma já está definido: é ele que vai na ficha.</p>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:28px 22px;margin-top:40px">
    ${PILOTO.map(miniatura).join('')}
  </div>
  <div class="nota" style="margin:auto 0 32px">Mande estas dez primeiro. Depois, cada peça nova ganha o próximo número, a partir do 0033.</div>
  ${rodape(7)}
</div>`)])

/* ------------------------------------------------------------------ a ficha */

const caixa = (texto) =>
  `<span style="display:inline-flex;align-items:center;gap:8px;margin-right:22px;white-space:nowrap"><span style="width:22px;height:22px;border:2px solid ${tinta};display:inline-block"></span>${texto}</span>`

/** Um campo de escrever à mão: rótulo e a linha. `largura` fixa só a linha. */
const linha = (rotulo, largura) =>
  `<div style="display:flex;align-items:flex-end;gap:12px;${largura ? '' : 'flex:1;'}"><span style="white-space:nowrap">${rotulo}</span><span style="${largura ? `width:${largura}` : 'flex:1'};border-bottom:2px solid ${tinta};height:30px"></span></div>`

/**
 * A ficha de papel. Duas por folha A4, e não quatro: o Carlos preenche à
 * mão, e letra de mão precisa de linha comprida e de espaço entre as linhas.
 * Os campos seguem a ordem em que se olha para uma peça: o que é, de que é,
 * que tamanho tem, quanto custa.
 */
const FICHA = `
<div style="border:3px solid ${tinta};padding:26px 32px;display:flex;flex-direction:column;gap:16px;font-size:20px;color:${tinta};height:100%;box-sizing:border-box">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-family:Fraunces,Georgia,serif;font-size:34px;line-height:1">Ficha da peça</div>
      <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6F6255;margin-top:8px">Carlos Oliveira · mestre entalhador</div>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <span style="font-size:15px;letter-spacing:.14em;text-transform:uppercase">Número</span>
      <span style="width:170px;height:58px;border:3px solid ${tinta};display:block"></span>
    </div>
  </div>
  ${linha('Nome da peça')}
  <div>${caixa('Sacra')}${caixa('Bicho')}${caixa('Figura')}${caixa('Natureza')}${caixa('Relógio, moldura ou móvel')}</div>
  ${linha('Madeira')}
  <div style="display:flex;gap:26px;align-items:flex-end">${linha('Altura', '70px')}${linha('Largura', '70px')}${linha('Fundura', '70px')}<span>cm</span></div>
  <div style="display:flex;gap:26px">${linha('Ano (mais ou menos)', '110px')}${linha('Preço R$')}</div>
  <div>${caixa('Está à venda')}${caixa('Não está à venda')}</div>
  ${linha('Observação')}
  ${linha('')}
</div>`

const FOLHA_CSS = `
@page { size: A4; margin: 0; }
html, body { width: 210mm; height: 297mm; }
body { width: 210mm; height: 297mm; background: #FFFFFF; }
.folha { width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; display: grid; grid-template-rows: 1fr 1fr; gap: 10mm; }
.folha > div { min-height: 0; }
`

const folha = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}${FOLHA_CSS}</style></head><body><div class="folha">${Array(2).fill(`<div>${FICHA}</div>`).join('')}</div></body></html>`

/* ----------------------------------------------------------------- render */

async function acharEdge() {
  const { access } = await import('node:fs/promises')
  for (const caminho of EDGE) {
    try {
      await access(caminho)
      return caminho
    } catch {}
  }
  throw new Error('Microsoft Edge não encontrado. É ele que transforma os cartões em imagem.')
}

const edge = await acharEdge()
await mkdir(SAIDA, { recursive: true })
await mkdir(TEMP, { recursive: true })

const base = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--virtual-time-budget=10000', '--allow-file-access-from-files']

for (const [nome, html] of cartoes) {
  const arquivo = path.join(TEMP, `${nome}.html`)
  await writeFile(arquivo, html, 'utf8')
  await executar(edge, [...base, '--window-size=1080,1350', `--screenshot=${path.join(SAIDA, `${nome}.png`)}`, pathToFileURL(arquivo).href])
  console.log(`cartão ${nome}.png`)
}

const arquivoFolha = path.join(TEMP, 'ficha-da-peca.html')
await writeFile(arquivoFolha, folha, 'utf8')
await executar(edge, [...base, '--no-pdf-header-footer', `--print-to-pdf=${path.join(SAIDA, 'ficha-da-peca.pdf')}`, pathToFileURL(arquivoFolha).href])
// A4 em 96 dpi é 794x1123; em 2x fica nítido no celular.
await executar(edge, [...base.filter((a) => !a.startsWith('--force-device')), '--force-device-scale-factor=2', '--window-size=794,1123', `--screenshot=${path.join(SAIDA, 'ficha-da-peca.png')}`, pathToFileURL(arquivoFolha).href])
console.log('ficha-da-peca.pdf e .png')
