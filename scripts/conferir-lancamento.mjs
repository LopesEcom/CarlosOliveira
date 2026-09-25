/**
 * PODE IR AO AR? (Etapa 8)
 * ========================
 *
 *   npm run conferir
 *
 * Passa pelo que ainda é provisório no site e separa em dois montes:
 *
 *   ✗ BLOQUEIA   o site não pode ser divulgado assim (WhatsApp falso, domínio
 *                provisório). Sai com código 1, para dar para usar em CI.
 *   ! AVISO      pode ir ao ar, mas é coisa a resolver (Instagram vazio,
 *                fotos antigas, textos que o Carlos ainda não confirmou).
 *
 * Não está no `npm run build` de propósito: o site precisa continuar
 * publicando em prévia enquanto os bloqueios existem. É para rodar antes de
 * mandar o link para o mundo.
 */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const ler = (arquivo) => readFile(path.join(RAIZ, arquivo), 'utf8')

const brand = await ler('src/lib/brand.ts')
const valor = (padrao) => padrao.exec(brand)?.[1] ?? ''
const whatsapp = valor(/whatsapp: '([^']*)'/)
const instagram = valor(/instagram: '([^']*)'/)
const cidade = valor(/cidade: '([^']*)'/)
const siteUrl = valor(/export const SITE_URL = '([^']*)'/)
const verificacao = valor(/export const VERIFICACAO_GOOGLE = '([^']*)'/)

const acervo = JSON.parse(await ler('src/data/acervo.gerado.json'))

/*
  O painel (Supabase) é ligado pelas variáveis de ambiente: no .env.local
  desta máquina, ou na Vercel. Com ele ligado, WhatsApp, Instagram e cidade
  vêm das Configurações do painel, que este script não consegue ler (estão no
  banco): aí os avisos sobre eles viram lembretes de conferir lá.
*/
const envLocal = existsSync(path.join(RAIZ, '.env.local')) ? await ler('.env.local') : ''
const painelLigado =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) || /NEXT_PUBLIC_SUPABASE_URL=\S+/.test(envLocal)
const onde = painelLigado ? 'nas Configurações do painel (/admin)' : 'em src/lib/brand.ts'
const capa = await ler('src/components/Capa.tsx')
const livro = await ler('src/components/SecaoLivro.tsx')

const bloqueios = []
const avisos = []

/* ------------------------------------------------------------ contato */

if (!/^55\d{10,11}$/.test(whatsapp) || whatsapp.startsWith('5500')) {
  const texto = `WhatsApp padrão é o provisório (${whatsapp}). Preencher ${onde}: 55 + DDD + número.`
  // Com o painel ligado o número real mora no banco: só dá para lembrar.
  if (painelLigado) avisos.push(`${texto} Confira se já está preenchido.`)
  else bloqueios.push(texto)
}
if (siteUrl.endsWith('.vercel.app')) {
  bloqueios.push(`Domínio provisório (${siteUrl}). Trocar SITE_URL em src/lib/brand.ts quando o domínio estiver apontado.`)
}
if (!painelLigado) {
  bloqueios.push('Painel não ligado: sem Supabase, o Carlos não consegue publicar sozinho. Ver PAINEL.md.')
}
if (!instagram) avisos.push(`Instagram vazio no padrão: preencher ${onde}, se houver perfil.`)
if (!cidade) avisos.push(`Cidade vazia no padrão: preencher ${onde}.`)
if (!verificacao) {
  avisos.push('Sem verificação do Search Console no HTML (VERIFICACAO_GOOGLE). Tudo bem se for verificar pelo DNS.')
}

/* ------------------------------------------------------------- acervo */

const pecas = acervo.pecas ?? []
const antigas = pecas.filter((p) => p.origemFotos === 'antiga').length
if (antigas) avisos.push(`${antigas} de ${pecas.length} peças ainda com fotos antigas do WhatsApp (Etapa 2).`)

const semPreco = pecas.filter((p) => p.preco?.modo === 'consulta').length
if (semPreco === pecas.length) avisos.push('Todas as peças estão "sob consulta": decidir se o site mostra preço (Etapa 0).')

const semFicha = pecas.filter((p) => !p.madeira || !p.medidas).length
if (semFicha) avisos.push(`${semFicha} peças sem madeira ou medidas na ficha técnica.`)

if (existsSync(path.join(RAIZ, 'acervo/relatorio.md'))) {
  const relatorio = await ler('acervo/relatorio.md')
  const fora = /\*\*(\d+)\*\* peça\(s\) fora do site/.exec(relatorio)?.[1]
  if (fora && fora !== '0') avisos.push(`${fora} peça(s) da planilha fora do site (ver acervo/relatorio.md).`)
}

/* ------------------------------------------------ textos a confirmar */

if (capa.includes('Sem molde, sem resina, sem emenda')) {
  avisos.push('A capa diz "Sem molde, sem resina, sem emenda", que não veio do Carlos. Confirmar com ele.')
}
if (livro.includes('TODO')) avisos.push('Os tópicos do manual de entalhes (seção do livro) são genéricos. Trocar pelo sumário real.')
avisos.push('Marca provisória (Source Serif 4 + Inter, nogueira) até o Carlos escolher o caminho da Etapa 1.')

/* ---------------------------------------------------------- resultado */

console.log('\nPode ir ao ar?\n')
for (const b of bloqueios) console.log(`  ✗ ${b}`)
if (bloqueios.length && avisos.length) console.log('')
for (const a of avisos) console.log(`  ! ${a}`)
console.log(
  bloqueios.length
    ? `\n${bloqueios.length} bloqueio(s). Ainda não divulgue o link.\n`
    : '\nNenhum bloqueio. Os avisos podem ir sendo resolvidos com o site no ar.\n',
)
process.exit(bloqueios.length ? 1 : 0)
