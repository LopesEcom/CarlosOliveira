import FormularioEntrada from '../../../components/admin/FormularioEntrada'

export const metadata = { title: 'Entrar' }

export default function Entrar() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div>
          <span className="eyebrow">Carlos Oliveira</span>
          <h1 className="mt-3 texto-display-sm">Painel da oficina</h1>
          <p className="mt-3 text-sm text-cinza">Entre para cuidar do acervo e ver os resultados do site.</p>
        </div>
        <FormularioEntrada />
      </div>
    </main>
  )
}
