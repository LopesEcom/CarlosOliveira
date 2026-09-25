'use client'

import { useState, useTransition, type ReactNode } from 'react'

import { salvarConfiguracoes } from '../../app/admin/acoes/configuracoes'
import { sair } from '../../app/admin/acoes/sessao'
import { linkWhatsApp } from '../../lib/brand'
import { mensagemCompra } from '../../lib/mensagens'
import type { Configuracoes, Peca } from '../../lib/tipos'
import { useAvisos } from '../../lib/admin/avisos'

/** Peça de exemplo, só para a prévia da mensagem. Não vai para lugar nenhum. */
const EXEMPLO: Peca = {
  id: 'exemplo',
  numero: '0002',
  slug: '0002-coruja',
  nome: 'Coruja',
  tema: 'fauna',
  descricao: '',
  historia: null,
  madeira: null,
  altura: null,
  largura: null,
  profundidade: null,
  peso: null,
  ano: null,
  acabamento: null,
  preco: null,
  precoOriginal: null,
  aPartirDe: false,
  situacao: 'a-venda',
  aceitaEncomenda: true,
  destaque: false,
  ativo: true,
  etiqueta: null,
  colecoes: [],
  imagens: [],
  ordem: 0,
  criadoEm: '',
}

/**
 * CONFIGURAÇÕES.
 * ==============
 *
 * O WhatsApp é o que mais importa aqui: é para ele que vai toda conversa do
 * site. A mensagem de compra tem uma prévia que se monta enquanto se digita,
 * e um link para testar mandando para si mesmo.
 */
export default function FormularioConfiguracoes({ inicial }: { inicial: Configuracoes }) {
  const avisar = useAvisos()
  const [c, setC] = useState(inicial)
  const [salvando, iniciar] = useTransition()
  const [saindo, iniciarSaida] = useTransition()

  const contato = (campo: keyof Configuracoes['contato']) => (e: { target: { value: string } }) =>
    setC((atual) => ({ ...atual, contato: { ...atual.contato, [campo]: e.target.value } }))

  const previa = mensagemCompra(c.mensagemPeca, EXEMPLO)

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          iniciar(async () => {
            const r = await salvarConfiguracoes(c)
            avisar(r.ok ? 'Configurações salvas. Já valem no site.' : (r.erro ?? 'Não foi possível salvar.'), r.ok ? 'sucesso' : 'erro')
          })
        }}
        className="flex flex-col gap-10"
      >
        <Secao titulo="Contato">
          <Campo rotulo="WhatsApp" dica="Só números, com 55 e o DDD. Ex.: 5522999998888. É para cá que vão todas as conversas do site.">
            <input value={c.contato.whatsapp} onChange={contato('whatsapp')} inputMode="numeric" required className="input" />
          </Campo>
          <Campo rotulo="WhatsApp escrito" dica="Como o número aparece na página de contato. Ex.: (22) 99999-8888. Vazio, não aparece.">
            <input value={c.contato.whatsappExibicao} onChange={contato('whatsappExibicao')} className="input" />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Instagram" dica="Com arroba. Vazio esconde o link.">
              <input value={c.contato.instagram} onChange={contato('instagram')} placeholder="@" className="input" />
            </Campo>
            <Campo rotulo="Cidade da oficina" dica="Aparece na página de contato.">
              <input value={c.contato.cidade} onChange={contato('cidade')} className="input" />
            </Campo>
          </div>
          <Campo rotulo="E-mail">
            <input type="email" value={c.contato.email} onChange={contato('email')} className="input" />
          </Campo>
        </Secao>

        <Secao titulo="Mensagem de compra">
          <Campo rotulo="Começo da mensagem" dica="{peca} vira o número e o nome da peça; {link}, o endereço da página dela.">
            <textarea
              value={c.mensagemPeca}
              onChange={(e) => setC((atual) => ({ ...atual, mensagemPeca: e.target.value }))}
              rows={3}
              className="input resize-y"
            />
          </Campo>
          <div className="border border-borda bg-borda-sutil/40 p-4">
            <span className="rotulo text-cinza">Como chega para o senhor</span>
            <p className="mt-2 whitespace-pre-line text-sm">{previa}</p>
            <a
              href={linkWhatsApp(c.contato.whatsapp, previa)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-cinza underline underline-offset-4"
            >
              Testar no WhatsApp
            </a>
          </div>
        </Secao>

        <button type="submit" disabled={salvando} className="btn-primario self-start">
          {salvando ? 'Salvando' : 'Salvar configurações'}
        </button>
      </form>

      {/* No celular, sair não está na barra de baixo: fica aqui. */}
      <div className="border-t border-borda pt-6 lg:hidden">
        <button type="button" disabled={saindo} onClick={() => iniciarSaida(() => sair())} className="btn-contorno btn-sm">
          {saindo ? 'Saindo' : 'Sair do painel'}
        </button>
      </div>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h4">{titulo}</h2>
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
