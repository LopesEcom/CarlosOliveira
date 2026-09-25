import { notFound } from 'next/navigation'

import FormularioPeca from '../../../../components/admin/FormularioPeca'
import { getColecoesAdmin, getEtiquetas, getPecaAdmin, getPecasAdmin } from '../../../../lib/admin/consultas'
import { dadosDaLinha } from '../../../../lib/admin/peca'
import { exigirSessao } from '../../../../lib/admin/sessao'

export const metadata = { title: 'Editar peça' }

export default async function EditarPeca({ params }: { params: Promise<{ id: string }> }) {
  await exigirSessao()
  const { id } = await params
  const peca = await getPecaAdmin(id)
  if (!peca) notFound()

  const [pecas, colecoes, etiquetas] = await Promise.all([getPecasAdmin(), getColecoesAdmin(), getEtiquetas()])
  const madeiras = [...new Set(pecas.map((p) => p.madeira).filter((m): m is string => Boolean(m)))].sort()

  return (
    <main className="flex flex-col gap-8 p-6 lg:p-10">
      <header>
        <span className="rotulo text-cinza">Nº {peca.numero}</span>
        <h1 className="mt-2 texto-display-sm">{peca.nome}</h1>
        {peca.ativo && (peca.imagens ?? []).length > 0 ? (
          <a href={`/peca/${peca.slug}`} target="_blank" className="mt-2 inline-block text-sm text-cinza underline underline-offset-4">
            Ver como está no site
          </a>
        ) : (
          <p className="mt-2 text-sm text-cinza">
            {peca.ativo ? 'Ainda não aparece no site: falta pelo menos uma foto.' : 'Fora do site: a chave "Mostrar no site" está desligada.'}
          </p>
        )}
      </header>
      <FormularioPeca
        id={peca.id}
        inicial={dadosDaLinha(peca)}
        colecoes={colecoes.map((c) => ({ slug: c.slug, nome: c.nome }))}
        etiquetas={etiquetas.map((e) => e.texto)}
        madeiras={madeiras}
      />
    </main>
  )
}
