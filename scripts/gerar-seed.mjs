/**
 * CARGA INICIAL DO SUPABASE, A PARTIR DA PLANILHA.
 * ================================================
 *
 *   npm run acervo   (se a planilha mudou)
 *   npm run seed     gera supabase/seed.sql
 *
 * Lê `src/data/acervo.gerado.json` (o que sai de acervo/acervo.xlsx) e
 * escreve o SQL que põe as coleções e as peças no banco. É o que faz as 31
 * peças já cadastradas aparecerem no painel sem ninguém digitar de novo.
 *
 * NÃO APAGA NEM SOBRESCREVE: peça com número que já existe no banco é pulada
 * (`on conflict do nothing`). Rodar de novo depois que o Carlos já mexeu no
 * painel não desfaz o que ele fez. Depois da carga, a fonte da verdade é o
 * painel, e não mais a planilha.
 *
 * As fotos continuam onde estão: em public/obras (as antigas, do WhatsApp)
 * ou public/acervo (as do `npm run fotos`). O banco guarda o caminho, e o
 * site entende os dois tipos (ver lib/supabase/env.ts, urlDaImagem).
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const dados = JSON.parse(await readFile(path.join(RAIZ, 'src/data/acervo.gerado.json'), 'utf8'))

/** Texto para SQL: aspas simples dobradas, e nulo quando não há valor. */
const texto = (v) => (v === undefined || v === null || v === '' ? 'null' : `'${String(v).replaceAll("'", "''")}'`)
const numero = (v) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : 'null')
const lista = (itens) => `array[${itens.map(texto).join(', ')}]::text[]`
const booleano = (v) => (v ? 'true' : 'false')

const colecoes = dados.colecoes.map(
  (c, i) =>
    `  (${texto(c.id)}, ${texto(c.nome)}, ${texto(c.descricao)}, ${i + 1})`,
)

const pecas = dados.pecas.map((p, i) => {
  const valor = p.preco.modo === 'consulta' ? null : p.preco.valor
  return `  (${[
    texto(p.numero),
    texto(p.id),
    texto(p.nome),
    texto(p.categoria),
    texto(p.descricao),
    texto(p.historia),
    texto(p.madeira),
    numero(p.medidas?.altura),
    numero(p.medidas?.largura),
    numero(p.medidas?.profundidade),
    numero(p.peso),
    numero(p.ano),
    texto(p.acabamento),
    numero(valor),
    booleano(p.preco.modo === 'a-partir-de'),
    texto(p.situacao),
    booleano(p.aceitaEncomenda),
    booleano(p.destaque),
    lista(p.colecoes),
    lista(p.fotos.map((f) => f.src)),
    String(i + 1),
  ].join(', ')})`
})

const sql = `-- ============================================================================
-- Carga inicial: as coleções e as peças da planilha (acervo/acervo.xlsx).
-- Gerado por \`npm run seed\` em ${new Date().toLocaleString('pt-BR')}. Não edite à mão.
--
-- Rode no SQL Editor do Supabase DEPOIS do migrations/001_esquema.sql.
-- Pode rodar de novo: o que já existe (mesmo slug, mesmo número) é pulado.
-- ============================================================================

insert into public.colecoes (slug, nome, descricao, ordem) values
${colecoes.join(',\n')}
on conflict (slug) do nothing;

insert into public.pecas (
  numero, slug, nome, tema, descricao, historia, madeira, altura, largura, profundidade,
  peso, ano, acabamento, preco, a_partir_de, situacao, aceita_encomenda, destaque,
  colecoes, imagens, ordem
) values
${pecas.join(',\n')}
on conflict (numero) do nothing;
`

await writeFile(path.join(RAIZ, 'supabase/seed.sql'), sql, 'utf8')
console.log(`supabase/seed.sql: ${dados.colecoes.length} coleções e ${dados.pecas.length} peças.`)
