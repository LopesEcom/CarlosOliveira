import PainelColecoes from '../../../components/admin/PainelColecoes'
import { getColecoesAdmin } from '../../../lib/admin/consultas'
import { exigirSessao } from '../../../lib/admin/sessao'

export const metadata = { title: 'Coleções' }

export default async function Colecoes() {
  await exigirSessao()
  const colecoes = await getColecoesAdmin()

  return (
    <main className="flex flex-col gap-8 p-6 lg:p-10">
      <header>
        <h1 className="texto-display-sm">Coleções</h1>
        <p className="mt-2 max-w-prose text-sm text-cinza">
          É por elas que as pessoas escolhem pelo lugar da casa. A ordem daqui é a ordem das capas no site.
        </p>
      </header>
      <PainelColecoes colecoes={colecoes} />
    </main>
  )
}
