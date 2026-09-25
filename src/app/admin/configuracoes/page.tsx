import FormularioConfiguracoes from '../../../components/admin/FormularioConfiguracoes'
import { getConfiguracoesAdmin } from '../../../lib/admin/consultas'
import { exigirSessao } from '../../../lib/admin/sessao'

export const metadata = { title: 'Configurações' }

export default async function Configuracoes() {
  await exigirSessao()
  const configuracoes = await getConfiguracoesAdmin()

  return (
    <main className="flex flex-col gap-8 p-6 lg:p-10">
      <header>
        <h1 className="texto-display-sm">Configurações</h1>
        <p className="mt-2 text-sm text-cinza">O WhatsApp, o Instagram e a mensagem que chega quando alguém quer uma peça.</p>
      </header>
      <FormularioConfiguracoes inicial={configuracoes} />
    </main>
  )
}
