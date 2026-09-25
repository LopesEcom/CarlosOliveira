import PainelEtiquetas from '../../../components/admin/PainelEtiquetas'
import { getEtiquetas } from '../../../lib/admin/consultas'
import { exigirSessao } from '../../../lib/admin/sessao'

export const metadata = { title: 'Etiquetas' }

export default async function Etiquetas() {
  await exigirSessao()
  const etiquetas = await getEtiquetas()

  return (
    <main className="flex flex-col gap-8 p-6 lg:p-10">
      <header>
        <h1 className="texto-display-sm">Etiquetas</h1>
        <p className="mt-2 max-w-prose text-sm text-cinza">
          As sugestões de selo que aparecem no canto da foto das peças. Tirar uma daqui não tira o selo das peças que já
          usam.
        </p>
      </header>
      <PainelEtiquetas etiquetas={etiquetas} />
    </main>
  )
}
