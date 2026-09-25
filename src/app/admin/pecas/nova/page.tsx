import FormularioPeca from '../../../../components/admin/FormularioPeca'
import { getColecoesAdmin, getEtiquetas, getPecasAdmin, proximoNumero } from '../../../../lib/admin/consultas'
import { pecaVazia } from '../../../../lib/admin/peca'
import { exigirSessao } from '../../../../lib/admin/sessao'

export const metadata = { title: 'Nova peça' }

export default async function NovaPeca() {
  await exigirSessao()
  const [pecas, colecoes, etiquetas] = await Promise.all([getPecasAdmin(), getColecoesAdmin(), getEtiquetas()])
  const madeiras = [...new Set(pecas.map((p) => p.madeira).filter((m): m is string => Boolean(m)))].sort()

  return (
    <main className="flex flex-col gap-8 p-6 lg:p-10">
      <header>
        <h1 className="texto-display-sm">Nova peça</h1>
        <p className="mt-2 text-sm text-cinza">Só o nome é obrigatório. O resto pode preencher depois.</p>
      </header>
      <FormularioPeca
        inicial={pecaVazia(proximoNumero(pecas))}
        colecoes={colecoes.map((c) => ({ slug: c.slug, nome: c.nome }))}
        etiquetas={etiquetas.map((e) => e.texto)}
        madeiras={madeiras}
      />
    </main>
  )
}
