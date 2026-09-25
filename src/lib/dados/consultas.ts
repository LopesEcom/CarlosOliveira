import { unstable_cache } from 'next/cache'

import { supabaseConfigurado } from '../supabase/env'
import { clientePublico } from '../supabase/publico'
import type { Colecao, Configuracoes, Peca } from '../tipos'
import { colecaoDaLinha, pecaDaLinha, type LinhaColecao, type LinhaPeca } from './linhas'
import { colecoesLocais, pecasLocais } from './local'
import { CONFIGURACOES_PADRAO } from './padrao'

/**
 * AS LEITURAS DO SITE PÚBLICO.
 * ============================
 *
 * O acervo inteiro é lido de uma vez e filtrado em memória (lib/dados/acervo.ts).
 * São centenas de peças, não milhares: uma consulta só, guardada em cache,
 * sai mais barata que uma consulta por combinação de filtro, e as contagens
 * dos filtros batem sempre com a lista, porque saem da mesma leitura.
 *
 * CACHE POR ETIQUETA
 * ------------------
 * Cada leitura fica guardada com uma etiqueta (`pecas`, `colecoes`,
 * `configuracoes`). O painel, ao salvar, limpa a etiqueta correspondente
 * (ver src/app/admin/acoes/), e a mudança aparece no site na hora. A
 * revalidação de uma hora é só a rede de segurança.
 *
 * SEM SUPABASE
 * ------------
 * Enquanto as variáveis não existem, tudo vem da planilha
 * (`acervo.gerado.json`). O site é o mesmo; só o painel fica indisponível.
 */

export const ETIQUETA_PECAS = 'pecas'
export const ETIQUETA_COLECOES = 'colecoes'
export const ETIQUETA_CONFIGURACOES = 'configuracoes'

const UMA_HORA = 3600

/* ----------------------------------------------------------------- peças */

async function lerPecas(): Promise<Peca[]> {
  const { data, error } = await clientePublico()
    .from('pecas')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('numero', { ascending: true })

  if (error) throw new Error(`Falha ao ler o acervo: ${error.message}`)
  // Peça sem nenhuma foto fica guardada no painel mas não entra no site: a
  // mesma regra da planilha. Um quadrado cinza no acervo não vende nada.
  return (data as LinhaPeca[]).map(pecaDaLinha).filter((p) => p.imagens.length > 0)
}

const pecasEmCache = unstable_cache(lerPecas, ['pecas'], { revalidate: UMA_HORA, tags: [ETIQUETA_PECAS] })

/** Todas as peças publicadas, na ordem do acervo. */
export async function getPecas(): Promise<Peca[]> {
  return supabaseConfigurado() ? pecasEmCache() : pecasLocais
}

export async function getPecaPorSlug(slug: string): Promise<Peca | null> {
  const pecas = await getPecas()
  return pecas.find((p) => p.slug === slug) ?? null
}

/* -------------------------------------------------------------- coleções */

async function lerColecoes(): Promise<Colecao[]> {
  const { data, error } = await clientePublico().from('colecoes').select('*').order('ordem', { ascending: true })
  if (error) throw new Error(`Falha ao ler as coleções: ${error.message}`)
  return (data as LinhaColecao[]).map(colecaoDaLinha)
}

const colecoesEmCache = unstable_cache(lerColecoes, ['colecoes'], {
  revalidate: UMA_HORA,
  tags: [ETIQUETA_COLECOES],
})

export async function getColecoes(): Promise<Colecao[]> {
  return supabaseConfigurado() ? colecoesEmCache() : colecoesLocais
}

/* --------------------------------------------------------- configurações */

function objeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === 'object' && !Array.isArray(valor) ? (valor as Record<string, unknown>) : {}
}

/** Campo vazio no banco não apaga o padrão: só texto preenchido vale. */
function preenchidos(valor: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(valor).filter((par): par is [string, string] => typeof par[1] === 'string' && par[1].trim() !== ''),
  )
}

async function lerConfiguracoes(): Promise<Configuracoes> {
  try {
    const { data, error } = await clientePublico().from('configuracoes').select('chave, valor')
    if (error) throw error
    const porChave = new Map((data ?? []).map((l: { chave: string; valor: unknown }) => [l.chave, l.valor]))
    const contato = preenchidos(objeto(porChave.get('contato')))
    const mensagem = preenchidos(objeto(porChave.get('mensagem')))
    return {
      contato: { ...CONFIGURACOES_PADRAO.contato, ...contato },
      mensagemPeca: mensagem.peca ?? CONFIGURACOES_PADRAO.mensagemPeca,
    }
  } catch (erro) {
    // O rodapé e o WhatsApp aparecem em toda página: banco fora do ar cai no
    // padrão em vez de derrubar o site.
    console.error('Falha ao ler as configurações:', erro)
    return CONFIGURACOES_PADRAO
  }
}

const configuracoesEmCache = unstable_cache(lerConfiguracoes, ['configuracoes'], {
  revalidate: UMA_HORA,
  tags: [ETIQUETA_CONFIGURACOES],
})

export async function getConfiguracoes(): Promise<Configuracoes> {
  return supabaseConfigurado() ? configuracoesEmCache() : CONFIGURACOES_PADRAO
}
