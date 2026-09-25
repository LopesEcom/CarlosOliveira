'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'

import { atualizarPeca, criarPeca } from '../../app/admin/acoes/pecas'
import { centavosParaTexto, textoParaCentavos } from '../../lib/admin/moeda'
import { LIMITE_ETIQUETA, type DadosPeca } from '../../lib/admin/peca'
import { rotulosSituacao, rotulosTema, SITUACOES, TEMAS } from '../../lib/tipos'
import { useAvisos } from '../../lib/admin/avisos'
import EnvioFotos from './EnvioFotos'
import Interruptor from './Interruptor'

interface FormularioPecaProps {
  /** Ausente na peça nova. */
  id?: string
  inicial: DadosPeca
  colecoes: { slug: string; nome: string }[]
  etiquetas: string[]
  /** Madeiras já usadas, para sugerir em vez de digitar de novo (e o filtro não ter "Cedro" e "cedro"). */
  madeiras: string[]
}

/**
 * O CADASTRO DE UMA PEÇA.
 * =======================
 *
 * Na ordem da ficha de papel: número e nome primeiro, depois o que o Carlos
 * mede e escreve, depois preço, fotos e onde a peça aparece. Só o nome é
 * obrigatório; o resto pode ser preenchido depois.
 */
export default function FormularioPeca({ id, inicial, colecoes, etiquetas, madeiras }: FormularioPecaProps) {
  const router = useRouter()
  const avisar = useAvisos()
  const [salvando, iniciar] = useTransition()
  const [d, setD] = useState<DadosPeca>(inicial)
  const [erro, setErro] = useState<string | null>(null)

  const muda = <K extends keyof DadosPeca>(campo: K, valor: DadosPeca[K]) => setD((atual) => ({ ...atual, [campo]: valor }))
  const texto = (campo: keyof DadosPeca) => (e: { target: { value: string } }) => muda(campo, e.target.value as never)

  function salvar() {
    setErro(null)
    iniciar(async () => {
      const r = id ? await atualizarPeca(id, d) : await criarPeca(d)
      if (!r.ok) {
        setErro(r.erro ?? 'Não foi possível salvar.')
        avisar(r.erro ?? 'Não foi possível salvar.', 'erro')
        return
      }
      avisar(id ? 'Alterações salvas. Já estão no site.' : `${d.nome} foi cadastrada.`)
      // Peça nova vai para a edição dela: quem acabou de cadastrar costuma
      // querer conferir ou pôr mais uma foto.
      if (!id && r.id) router.push(`/admin/pecas/${r.id}`)
      else router.refresh()
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        salvar()
      }}
      className="flex max-w-3xl flex-col gap-10"
    >
      <Secao titulo="A peça">
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <Campo rotulo="Número" dica="O da ficha de papel.">
            <input value={d.numero} onChange={texto('numero')} inputMode="numeric" className="input" />
          </Campo>
          <Campo rotulo="Nome da peça" dica="O que aparece no site. Ex.: Coruja ao luar">
            <input value={d.nome} onChange={texto('nome')} required className="input" />
          </Campo>
        </div>
        <Campo rotulo="Tema">
          <select value={d.tema} onChange={texto('tema')} className="input cursor-pointer">
            {TEMAS.map((t) => (
              <option key={t} value={t}>
                {rotulosTema[t]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Descrição curta" dica="Uma linha: o que a peça é e como foi entalhada.">
          <input value={d.descricao} onChange={texto('descricao')} maxLength={160} className="input" />
        </Campo>
        <Campo rotulo="História da peça" dica="Opcional. Duas ou três frases, nas palavras do senhor.">
          <textarea value={d.historia} onChange={texto('historia')} rows={3} className="input resize-y" />
        </Campo>
      </Secao>

      <Secao titulo="Ficha técnica" dica="Tudo opcional. O que ficar vazio aparece no site como 'sob consulta'.">
        <Campo rotulo="Madeira">
          <input value={d.madeira} onChange={texto('madeira')} list="madeiras" placeholder="Ex.: Cedro" className="input" />
          <datalist id="madeiras">
            {madeiras.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Campo>
        <div className="grid grid-cols-3 gap-3">
          <Campo rotulo="Altura (cm)">
            <input value={d.altura} onChange={texto('altura')} inputMode="decimal" className="input" />
          </Campo>
          <Campo rotulo="Largura (cm)">
            <input value={d.largura} onChange={texto('largura')} inputMode="decimal" className="input" />
          </Campo>
          <Campo rotulo="Fundura (cm)">
            <input value={d.profundidade} onChange={texto('profundidade')} inputMode="decimal" className="input" />
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Campo rotulo="Peso (kg)">
            <input value={d.peso} onChange={texto('peso')} inputMode="decimal" className="input" />
          </Campo>
          <Campo rotulo="Ano">
            <input value={d.ano} onChange={texto('ano')} inputMode="numeric" maxLength={4} className="input" />
          </Campo>
          <Campo rotulo="Acabamento">
            <input value={d.acabamento} onChange={texto('acabamento')} placeholder="Ex.: cera" className="input" />
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Preço e situação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Preço" dica="Deixe em branco para o site mostrar 'Valor sob consulta'.">
            <input
              value={centavosParaTexto(d.precoCentavos)}
              onChange={(e) => muda('precoCentavos', textoParaCentavos(e.target.value))}
              inputMode="numeric"
              placeholder="R$ 0,00"
              className="input"
            />
          </Campo>
          <Campo rotulo="Preço antigo, se estiver em promoção" dica="Aparece riscado ao lado do preço.">
            <input
              value={centavosParaTexto(d.precoOriginalCentavos)}
              onChange={(e) => muda('precoOriginalCentavos', textoParaCentavos(e.target.value))}
              inputMode="numeric"
              placeholder="R$ 0,00"
              className="input"
            />
          </Campo>
        </div>
        <Chave
          rotulo='Mostrar "a partir de"'
          explicacao="Para peça cujo valor muda com a madeira ou o tamanho."
          ligado={d.aPartirDe}
          aoMudar={(v) => muda('aPartirDe', v)}
        />
        <Campo rotulo="Situação">
          <select value={d.situacao} onChange={texto('situacao')} className="input cursor-pointer">
            {SITUACOES.map((s) => (
              <option key={s} value={s}>
                {rotulosSituacao[s]}
              </option>
            ))}
          </select>
        </Campo>
        <Chave
          rotulo="Aceita encomenda de uma parecida"
          explicacao="Vendida ou reservada, a página oferece pedir uma parecida."
          ligado={d.aceitaEncomenda}
          aoMudar={(v) => muda('aceitaEncomenda', v)}
        />
      </Secao>

      <Secao titulo="Fotos">
        <EnvioFotos valor={d.imagens} aoMudar={(v) => muda('imagens', v)} avisar={avisar} />
      </Secao>

      <Secao titulo="Onde aparece">
        {colecoes.length > 0 && (
          <fieldset>
            <legend className="label">Coleções</legend>
            <div className="flex flex-wrap gap-2">
              {colecoes.map((c) => {
                const marcada = d.colecoes.includes(c.slug)
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={marcada}
                    onClick={() => muda('colecoes', marcada ? d.colecoes.filter((s) => s !== c.slug) : [...d.colecoes, c.slug])}
                    className={
                      marcada
                        ? 'border border-tinta bg-tinta px-4 py-2.5 text-sm text-creme'
                        : 'border border-borda px-4 py-2.5 text-sm hover:border-tinta'
                    }
                  >
                    {c.nome}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}
        <Campo rotulo="Selo" dica={`O selinho no canto da foto, no acervo. Até ${LIMITE_ETIQUETA} letras. Vazio, sem selo.`}>
          <input value={d.etiqueta} onChange={texto('etiqueta')} list="etiquetas" maxLength={LIMITE_ETIQUETA} className="input" />
          <datalist id="etiquetas">
            {etiquetas.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </Campo>
        <Chave
          rotulo="Mostrar no site"
          explicacao="Desligado, a peça fica guardada aqui e ninguém vê."
          ligado={d.ativo}
          aoMudar={(v) => muda('ativo', v)}
        />
        <Chave
          rotulo="Destacar no início"
          explicacao="Entra nas peças que deslizam na página inicial e na vitrine."
          ligado={d.destaque}
          aoMudar={(v) => muda('destaque', v)}
        />
      </Secao>

      {/* A barra de salvar fica presa embaixo: o formulário é longo, e o
          botão no fim obrigaria a rolar tudo depois de trocar uma foto. */}
      <div className="sticky bottom-16 z-10 -mx-6 flex flex-wrap items-center gap-4 border-t border-borda bg-branco/95 px-6 py-4 backdrop-blur-sm lg:bottom-0">
        <button type="submit" disabled={salvando} className="btn-primario">
          {salvando ? 'Salvando' : id ? 'Salvar alterações' : 'Cadastrar peça'}
        </button>
        <Link href="/admin/pecas" className="text-sm text-cinza underline underline-offset-4">
          Voltar sem salvar
        </Link>
        {erro && (
          <p role="alert" className="w-full text-sm text-erro">
            {erro}
          </p>
        )}
      </div>
    </form>
  )
}

function Secao({ titulo, dica, children }: { titulo: string; dica?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-borda pt-6 first:border-0 first:pt-0">
      <div>
        <h2 className="text-h4">{titulo}</h2>
        {dica && <p className="mt-1 text-sm text-cinza">{dica}</p>}
      </div>
      {children}
    </section>
  )
}

function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{rotulo}</span>
      {children}
      {dica && <span className="mt-1.5 block text-xs text-cinza">{dica}</span>}
    </label>
  )
}

function Chave({
  rotulo,
  explicacao,
  ligado,
  aoMudar,
}: {
  rotulo: string
  explicacao: string
  ligado: boolean
  aoMudar: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <Interruptor rotulo={rotulo} ligado={ligado} aoMudar={aoMudar} />
      <div>
        <p className="text-sm font-semibold">{rotulo}</p>
        <p className="text-xs text-cinza">{explicacao}</p>
      </div>
    </div>
  )
}
