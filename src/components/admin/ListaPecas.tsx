'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'

import { alternarCampo, excluirPeca, mudarSituacao, salvarEtiquetaDaPeca } from '../../app/admin/acoes/pecas'
import type { LinhaPeca } from '../../lib/dados/linhas'
import { normalizar, precoBRL } from '../../lib/formato'
import { urlDaImagem } from '../../lib/supabase/env'
import { rotulosSituacao, rotulosTema, SITUACOES, TEMAS, type Situacao } from '../../lib/tipos'
import { cn } from '../../lib/utils'
import { useAvisos } from '../../lib/admin/avisos'
import Interruptor from './Interruptor'

/**
 * A LISTA DE PEÇAS DO PAINEL.
 * ===========================
 *
 * O que o Carlos mais faz depois de uma venda é marcar a peça como vendida.
 * Por isso a situação, o selo, "No site" e "Destaque" mudam direto aqui, sem
 * abrir o formulário, e salvam na hora. O resto (fotos, medidas, preço) fica
 * no "Editar".
 *
 * Um cartão por peça em vez de tabela: o painel vai ser usado no celular, e
 * uma tabela de oito colunas em 375px vira rolagem de lado.
 */
export default function ListaPecas({ pecas, etiquetas }: { pecas: LinhaPeca[]; etiquetas: string[] }) {
  const avisar = useAvisos()
  const [busca, setBusca] = useState('')
  const [tema, setTema] = useState('')
  const [paraExcluir, setParaExcluir] = useState<LinhaPeca | null>(null)

  // Filtro no navegador: são centenas de peças, e sem ida ao servidor a busca
  // responde enquanto se digita.
  const visiveis = useMemo(() => {
    const termo = normalizar(busca)
    return pecas.filter(
      (p) => (!termo || normalizar(`${p.numero} ${p.nome}`).includes(termo)) && (!tema || p.tema === tema),
    )
  }, [pecas, busca, tema])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Buscar pelo nome ou número</span>
          <Search size={16} strokeWidth={1.5} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cinza" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pelo nome ou número"
            className="input pl-10"
          />
        </label>
        <select value={tema} onChange={(e) => setTema(e.target.value)} className="input w-auto cursor-pointer" aria-label="Tema">
          <option value="">Todos os temas</option>
          {TEMAS.map((t) => (
            <option key={t} value={t}>
              {rotulosTema[t]}
            </option>
          ))}
        </select>
        <p aria-live="polite" className="ml-auto text-xs text-cinza">
          {visiveis.length} de {pecas.length}
        </p>
      </div>

      {/* Uma lista de sugestões só, para todas as linhas. */}
      <datalist id="etiquetas-sugeridas">
        {etiquetas.map((e) => (
          <option key={e} value={e} />
        ))}
      </datalist>

      <ul className="flex flex-col border-t border-borda">
        {visiveis.map((peca) => (
          <Linha key={peca.id} peca={peca} aoExcluir={() => setParaExcluir(peca)} avisar={avisar} />
        ))}
      </ul>

      {visiveis.length === 0 && <p className="py-6 text-sm text-cinza">Nenhuma peça com essa busca.</p>}

      {paraExcluir && <ConfirmarExclusao peca={paraExcluir} aoFechar={() => setParaExcluir(null)} avisar={avisar} />}
    </div>
  )
}

function Linha({
  peca,
  aoExcluir,
  avisar,
}: {
  peca: LinhaPeca
  aoExcluir: () => void
  avisar: (texto: string, tom?: 'sucesso' | 'erro') => void
}) {
  const [ativo, setAtivo] = useState(peca.ativo)
  const [destaque, setDestaque] = useState(peca.destaque)
  const [situacao, setSituacao] = useState<Situacao>(peca.situacao)
  const [etiqueta, setEtiqueta] = useState(peca.etiqueta ?? '')
  const [salvando, iniciar] = useTransition()
  const capa = peca.imagens?.[0]

  /** Muda na tela na hora e desfaz se o servidor recusar: esperar cada clique deixaria a lista lenta. */
  function alternar(campo: 'ativo' | 'destaque', valor: boolean) {
    const definir = campo === 'ativo' ? setAtivo : setDestaque
    definir(valor)
    iniciar(async () => {
      const r = await alternarCampo(peca.id, campo, valor)
      if (!r.ok) {
        definir(!valor)
        avisar(r.erro ?? 'Não foi possível salvar.', 'erro')
      }
    })
  }

  function trocarSituacao(nova: Situacao) {
    const anterior = situacao
    setSituacao(nova)
    iniciar(async () => {
      const r = await mudarSituacao(peca.id, nova)
      if (r.ok) avisar(`${peca.nome}: ${rotulosSituacao[nova].toLowerCase()}.`)
      else {
        setSituacao(anterior)
        avisar(r.erro ?? 'Não foi possível salvar.', 'erro')
      }
    })
  }

  /** Grava o selo ao sair do campo: um botão por linha em trezentas linhas seria uma parede de botões. */
  function gravarEtiqueta() {
    const limpo = etiqueta.trim()
    if (limpo === (peca.etiqueta ?? '')) return
    iniciar(async () => {
      const r = await salvarEtiquetaDaPeca(peca.id, limpo)
      if (r.ok) avisar(limpo ? `${peca.nome}: selo "${limpo}".` : `${peca.nome} ficou sem selo.`)
      else {
        setEtiqueta(peca.etiqueta ?? '')
        avisar(r.erro ?? 'Não foi possível salvar.', 'erro')
      }
    })
  }

  return (
    <li className={cn('flex flex-col gap-4 border-b border-borda py-4 lg:flex-row lg:items-center', salvando && 'opacity-60')}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-borda-sutil">
          {capa && (
            // Miniatura de 56px: o <img> simples basta, sem o otimizador.
            <img src={urlDaImagem(capa)} alt="" className="size-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <span className="rotulo text-cinza">
            Nº {peca.numero} · {rotulosTema[peca.tema]}
          </span>
          <p className="truncate font-display text-h5">{peca.nome}</p>
          <p className="text-xs text-cinza">
            {peca.preco === null ? 'Sob consulta' : precoBRL(Number(peca.preco))}
            {!capa && ' · sem foto'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:shrink-0">
        <select
          value={situacao}
          onChange={(e) => trocarSituacao(e.target.value as Situacao)}
          aria-label={`Situação de ${peca.nome}`}
          className="h-10 cursor-pointer border border-borda bg-branco px-2 text-sm"
        >
          {SITUACOES.map((s) => (
            <option key={s} value={s}>
              {rotulosSituacao[s]}
            </option>
          ))}
        </select>

        <input
          aria-label={`Selo de ${peca.nome}`}
          list="etiquetas-sugeridas"
          value={etiqueta}
          maxLength={18}
          placeholder="sem selo"
          onChange={(e) => setEtiqueta(e.target.value)}
          onBlur={gravarEtiqueta}
          className="h-10 w-32 border border-borda bg-branco px-2 text-sm"
        />

        <label className="flex items-center gap-2 text-xs">
          <Interruptor rotulo={`Mostrar ${peca.nome} no site`} ligado={ativo} aoMudar={(v) => alternar('ativo', v)} />
          No site
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Interruptor rotulo={`Destacar ${peca.nome} no início`} ligado={destaque} aoMudar={(v) => alternar('destaque', v)} />
          Destaque
        </label>

        <div className="flex gap-4">
          <Link href={`/admin/pecas/${peca.id}`} className="rotulo underline underline-offset-4">
            Editar
          </Link>
          <button type="button" onClick={aoExcluir} className="rotulo text-cinza underline underline-offset-4 hover:text-erro">
            Excluir
          </button>
        </div>
      </div>
    </li>
  )
}

function ConfirmarExclusao({
  peca,
  aoFechar,
  avisar,
}: {
  peca: LinhaPeca
  aoFechar: () => void
  avisar: (texto: string, tom?: 'sucesso' | 'erro') => void
}) {
  const [excluindo, iniciar] = useTransition()

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label="Cancelar" onClick={aoFechar} className="absolute inset-0 bg-tinta/40" />
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-excluir" className="relative w-full max-w-md bg-branco p-6">
        <h2 id="titulo-excluir" className="text-h4">
          Excluir {peca.nome}?
        </h2>
        <p className="mt-3 text-sm text-tinta/75">
          A peça sai do site e as fotos dela são apagadas. Não dá para desfazer. Se ela só foi vendida, feche esta
          janela e mude a situação para "Vendida": ela continua no site como prova de ofício.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={excluindo}
            onClick={() =>
              iniciar(async () => {
                const r = await excluirPeca(peca.id)
                if (r.ok) {
                  avisar(`${peca.nome} foi excluída.`)
                  aoFechar()
                } else avisar(r.erro ?? 'Não foi possível excluir.', 'erro')
              })
            }
            className="btn border-erro bg-erro text-branco hover:opacity-90 disabled:opacity-50"
          >
            {excluindo ? 'Excluindo' : 'Excluir'}
          </button>
          <button type="button" onClick={aoFechar} className="btn-contorno">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
