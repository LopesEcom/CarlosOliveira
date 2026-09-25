import Link from 'next/link'

import ListaPecas from '../../../components/admin/ListaPecas'
import { getEtiquetas, getPecasAdmin } from '../../../lib/admin/consultas'
import { exigirSessao } from '../../../lib/admin/sessao'

export const metadata = { title: 'Peças' }

export default async function Pecas() {
  await exigirSessao()
  const [pecas, etiquetas] = await Promise.all([getPecasAdmin(), getEtiquetas()])

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="texto-display-sm">Peças</h1>
          <p className="mt-2 text-sm text-cinza">
            Situação, selo, "No site" e "Destaque" mudam aqui mesmo e valem no site na hora.
          </p>
        </div>
        <Link href="/admin/pecas/nova" className="btn-primario">
          Nova peça
        </Link>
      </header>
      <ListaPecas pecas={pecas} etiquetas={etiquetas.map((e) => e.texto)} />
    </main>
  )
}
