'use client'

import { useState, useTransition } from 'react'

import { excluirColecao, salvarColecao, trocarOrdem } from '../../app/admin/acoes/colecoes'
import type { ColecaoComTotal } from '../../lib/admin/consultas'
import { useAvisos } from '../../lib/admin/avisos'
import EnvioFotos from './EnvioFotos'

/**
 * AS COLEÇÕES.
 * ============
 *
 * O "lugar da casa" das peças (Devoção, Para a parede...). A ordem daqui é a
 * ordem das capas no site e dos filtros do acervo. Cada coleção se edita no
 * próprio cartão; a capa é opcional (sem ela, vale a foto da primeira peça).
 */
export default function PainelColecoes({ colecoes }: { colecoes: ColecaoComTotal[] }) {
  const avisar = useAvisos()
  const [ocupado, iniciar] = useTransition()

  function mover(i: number, para: number) {
    const a = colecoes[i]
    const b = colecoes[para]
    if (!a || !b) return
    iniciar(async () => {
      const r = await trocarOrdem({ id: a.id, ordem: a.ordem }, { id: b.id, ordem: b.ordem })
      if (!r.ok) avisar(r.erro ?? 'Não foi possível mudar a ordem.', 'erro')
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className={ocupado ? 'flex flex-col gap-4 opacity-60' : 'flex flex-col gap-4'}>
        {colecoes.map((c, i) => (
          <li key={c.id}>
            <CartaoColecao
              colecao={c}
              primeira={i === 0}
              ultima={i === colecoes.length - 1}
              aoSubir={() => mover(i, i - 1)}
              aoDescer={() => mover(i, i + 1)}
            />
          </li>
        ))}
      </ul>
      <NovaColecao />
    </div>
  )
}

function CartaoColecao({
  colecao,
  primeira,
  ultima,
  aoSubir,
  aoDescer,
}: {
  colecao: ColecaoComTotal
  primeira: boolean
  ultima: boolean
  aoSubir: () => void
  aoDescer: () => void
}) {
  const avisar = useAvisos()
  const [salvando, iniciar] = useTransition()
  const [nome, setNome] = useState(colecao.nome)
  const [descricao, setDescricao] = useState(colecao.descricao ?? '')
  const [capa, setCapa] = useState(colecao.imagem_capa ?? '')

  function salvar(novaCapa = capa) {
    iniciar(async () => {
      const r = await salvarColecao(colecao.id, { nome, descricao, imagemCapa: novaCapa })
      avisar(r.ok ? `${nome} salva.` : (r.erro ?? 'Não foi possível salvar.'), r.ok ? 'sucesso' : 'erro')
    })
  }

  function apagar() {
    if (!window.confirm(`Apagar a coleção ${colecao.nome}?`)) return
    iniciar(async () => {
      const r = await excluirColecao(colecao.id)
      avisar(r.ok ? `${colecao.nome} apagada.` : (r.erro ?? 'Não foi possível apagar.'), r.ok ? 'sucesso' : 'erro')
    })
  }

  return (
    <div className={salvando ? 'grid gap-5 border border-borda p-5 opacity-60 sm:grid-cols-[10rem_1fr]' : 'grid gap-5 border border-borda p-5 sm:grid-cols-[10rem_1fr]'}>
      <EnvioFotos
        uma
        pasta="colecoes"
        valor={capa ? [capa] : []}
        aoMudar={(v) => {
          const nova = v[0] ?? ''
          setCapa(nova)
          salvar(nova)
        }}
        avisar={avisar}
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rotulo text-cinza">{colecao.total === 1 ? '1 peça' : `${colecao.total} peças`}</span>
          <div className="flex gap-1">
            <button type="button" disabled={primeira} onClick={aoSubir} aria-label={`Subir ${colecao.nome}`} className="size-9 border border-borda disabled:opacity-30">
              ↑
            </button>
            <button type="button" disabled={ultima} onClick={aoDescer} aria-label={`Descer ${colecao.nome}`} className="size-9 border border-borda disabled:opacity-30">
              ↓
            </button>
          </div>
        </div>
        <label className="block">
          <span className="label">Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="label">Frase que aparece na capa</span>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input" />
        </label>
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={() => salvar()} disabled={salvando} className="btn-primario btn-sm">
            Salvar
          </button>
          <button type="button" onClick={apagar} className="text-sm text-cinza underline underline-offset-4 hover:text-erro">
            Apagar coleção
          </button>
        </div>
      </div>
    </div>
  )
}

function NovaColecao() {
  const avisar = useAvisos()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, iniciar] = useTransition()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        iniciar(async () => {
          const r = await salvarColecao(null, { nome, descricao, imagemCapa: '' })
          if (r.ok) {
            avisar(`Coleção ${nome} criada.`)
            setNome('')
            setDescricao('')
          } else avisar(r.erro ?? 'Não foi possível criar.', 'erro')
        })
      }}
      className="flex flex-col gap-4 border border-dashed border-borda p-5"
    >
      <h2 className="text-h4">Nova coleção</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Para o jardim" className="input" required />
        </label>
        <label className="block">
          <span className="label">Frase da capa</span>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input" />
        </label>
      </div>
      <button type="submit" disabled={salvando} className="btn-contorno btn-sm self-start">
        Criar coleção
      </button>
      <p className="text-xs text-cinza">Depois de criar, escolha as peças dela no cadastro de cada peça.</p>
    </form>
  )
}
