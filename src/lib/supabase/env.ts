/**
 * As variáveis do Supabase.
 *
 * Diferente do projeto da Lennys, a falta delas NÃO quebra o site: enquanto o
 * Supabase do Carlos não existe, o site mostra as peças da planilha
 * (`acervo.gerado.json`) e o painel explica o que falta configurar. É o que
 * deixa o `npm run dev` e o build funcionarem hoje, sem conta criada.
 */
export function supabaseConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function obrigatoria(nome: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(`Variável ${nome} não definida. Copie .env.example para .env.local e preencha com os dados do Supabase.`)
  }
  return valor
}

export const supabaseUrl = () => obrigatoria('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
export const supabaseAnonKey = () =>
  obrigatoria('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

/** O bucket das fotos das peças e das capas das coleções. */
export const BUCKET = 'pecas'

/**
 * Caminho do bucket → URL pública. Caminho que começa com `/` é arquivo de
 * public/ (as fotos antigas, do WhatsApp) e passa direto; `http` também.
 */
export function urlDaImagem(caminho: string): string {
  if (caminho.startsWith('/') || caminho.startsWith('http')) return caminho
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base}/storage/v1/object/public/${BUCKET}/${caminho}`
}
