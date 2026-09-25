'use client'

import { useActionState } from 'react'

import { entrar, type EstadoEntrada } from '../../app/admin/acoes/sessao'

export default function FormularioEntrada() {
  const [estado, acao, pendente] = useActionState<EstadoEntrada, FormData>(entrar, {})

  return (
    <form action={acao} className="flex flex-col gap-5">
      <label className="block">
        <span className="label">E-mail</span>
        <input name="email" type="email" autoComplete="email" required className="input" />
      </label>
      <label className="block">
        <span className="label">Senha</span>
        <input name="senha" type="password" autoComplete="current-password" required className="input" />
      </label>
      {estado.erro && (
        <p role="alert" className="text-sm text-erro">
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={pendente} className="btn-primario">
        {pendente ? 'Entrando' : 'Entrar'}
      </button>
    </form>
  )
}
