'use client'

import { useState, type FormEvent, type ReactNode } from 'react'

import { linkWhatsApp } from '../lib/brand'
import { useConfiguracoes } from '../lib/contato'
import { cn } from '../lib/utils'
import { IconeWhatsapp } from './icones'

const EXPERIENCIAS = ['Nunca entalhei', 'Já fiz um pouco', 'Já entalho'] as const
const TURNOS = ['Manhã', 'Tarde', 'Noite', 'Fim de semana'] as const

interface Inscricao {
  nome: string
  cidade: string
  idade: string
  experiencia: string
  turnos: string[]
  motivo: string
}

const VAZIA: Inscricao = { nome: '', cidade: '', idade: '', experiencia: '', turnos: [], motivo: '' }

/**
 * A pré-inscrição como mensagem, um campo por linha, com rótulo: o Carlos lê
 * no celular e, quando for montar as turmas, cada resposta está no mesmo
 * lugar de todas as outras.
 */
function mensagemDaInscricao(dados: Inscricao): string {
  const linhas = [
    'Olá, Carlos! Quero me pré-inscrever na escola de entalhadores.',
    '',
    `Nome: ${dados.nome.trim()}`,
    `Cidade: ${dados.cidade.trim()}`,
    dados.idade.trim() ? `Idade: ${dados.idade.trim()}` : null,
    `Experiência: ${dados.experiencia}`,
    dados.turnos.length > 0 ? `Melhor horário: ${dados.turnos.join(', ')}` : null,
    dados.motivo.trim() ? `\nPor que quero aprender: ${dados.motivo.trim()}` : null,
  ]
  /* `null` sai, e a linha vazia depois da saudação fica: é ela que separa o
     cumprimento das respostas. */
  return linhas.filter((linha) => linha !== null).join('\n')
}

/**
 * PRÉ-INSCRIÇÃO NA ESCOLA (Etapa 7).
 * ==================================
 *
 * Como o resto do site, termina no WhatsApp: o formulário organiza as
 * respostas e abre a conversa com a mensagem pronta. Não há servidor
 * guardando nada, então não há dado de ninguém parado num banco que precise
 * de cuidado. A lista de inscritos é a conversa do Carlos.
 *
 * É PRÉ-inscrição, e o texto diz isso: turma, data e valor ainda não existem
 * (ver A_DEFINIR na página). O que se pergunta aqui é o que ajuda a montar as
 * turmas quando existirem: de onde a pessoa é, se já entalha e quando pode.
 *
 * Obrigatórios só nome, cidade e experiência. O resto é opcional e dito
 * assim, porque cada campo obrigatório a mais é gente que desiste.
 */
export default function FormularioEscola() {
  const { contato } = useConfiguracoes()
  const [dados, setDados] = useState<Inscricao>(VAZIA)
  const [enviada, setEnviada] = useState<string | null>(null)

  const mudar = (campo: 'nome' | 'cidade' | 'idade' | 'motivo') => (evento: { target: { value: string } }) =>
    setDados((atual) => ({ ...atual, [campo]: evento.target.value }))

  function alternarTurno(turno: string) {
    setDados((atual) => ({
      ...atual,
      turnos: atual.turnos.includes(turno) ? atual.turnos.filter((t) => t !== turno) : [...atual.turnos, turno],
    }))
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    const link = linkWhatsApp(contato.whatsapp, mensagemDaInscricao(dados))
    /* Abre no toque de enviar, que é o gesto que o navegador aceita para
       abrir outra aba. Se ele bloquear mesmo assim, o link fica na tela. */
    window.open(link, '_blank', 'noopener,noreferrer')
    setEnviada(link)
  }

  if (enviada) {
    return (
      <div className="mx-auto max-w-lg border border-borda bg-branco p-6 text-center md:p-10">
        <p className="t-italico">Quase lá.</p>
        <p className="mt-4 text-tinta/75">
          A sua pré-inscrição abriu no WhatsApp, com a mensagem pronta. Falta só
          apertar <strong className="font-medium text-tinta">enviar</strong> lá.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={enviada} target="_blank" rel="noopener noreferrer" className="btn-primario">
            <IconeWhatsapp className="size-[1.15em] shrink-0" strokeWidth={1.75} />
            Abrir o WhatsApp
          </a>
          <button type="button" onClick={() => setEnviada(null)} className="btn-contorno">
            Corrigir os dados
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="mx-auto grid max-w-2xl gap-6 text-left sm:grid-cols-2">
      <Campo rotulo="Seu nome" obrigatorio>
        <input type="text" required autoComplete="name" value={dados.nome} onChange={mudar('nome')} className="input" />
      </Campo>
      <Campo rotulo="Cidade e estado" obrigatorio>
        <input
          type="text"
          required
          autoComplete="address-level2"
          placeholder="Ex.: Cabo Frio, RJ"
          value={dados.cidade}
          onChange={mudar('cidade')}
          className="input"
        />
      </Campo>

      <fieldset className="sm:col-span-2">
        <legend className="label">
          Você já entalha? <span className="normal-case tracking-normal text-cinza">(obrigatório)</span>
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {EXPERIENCIAS.map((opcao) => (
            <label key={opcao} className="cursor-pointer">
              {/* O rádio de verdade fica escondido e o rótulo vira o botão:
                  o `required` do grupo continua valendo, e o teclado também. */}
              <input
                type="radio"
                name="experiencia"
                value={opcao}
                required
                checked={dados.experiencia === opcao}
                onChange={() => setDados((atual) => ({ ...atual, experiencia: opcao }))}
                className="peer sr-only"
              />
              <Opcao>{opcao}</Opcao>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="sm:col-span-2">
        <legend className="label">
          Melhor horário <span className="normal-case tracking-normal text-cinza">(pode marcar mais de um)</span>
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {TURNOS.map((turno) => (
            <label key={turno} className="cursor-pointer">
              <input
                type="checkbox"
                checked={dados.turnos.includes(turno)}
                onChange={() => alternarTurno(turno)}
                className="peer sr-only"
              />
              <Opcao>{turno}</Opcao>
            </label>
          ))}
        </div>
      </fieldset>

      <Campo rotulo="Idade" opcional>
        <input type="number" inputMode="numeric" min={1} max={120} value={dados.idade} onChange={mudar('idade')} className="input" />
      </Campo>
      <div className="hidden sm:block" />

      <Campo rotulo="Por que quer aprender?" opcional largo>
        <textarea rows={3} value={dados.motivo} onChange={mudar('motivo')} className="input resize-none" />
      </Campo>

      <div className="flex flex-col items-center gap-4 pt-2 text-center sm:col-span-2">
        <button type="submit" className="btn-primario">
          <IconeWhatsapp className="size-[1.15em] shrink-0" strokeWidth={1.75} />
          Enviar pré-inscrição
        </button>
        <p className="max-w-sm text-xs text-cinza">
          Abre o WhatsApp do Carlos com as suas respostas. Nada fica guardado no site.
        </p>
      </div>
    </form>
  )
}

function Campo({
  rotulo,
  obrigatorio = false,
  opcional = false,
  largo = false,
  children,
}: {
  rotulo: string
  obrigatorio?: boolean
  opcional?: boolean
  largo?: boolean
  children: ReactNode
}) {
  return (
    <label className={cn('block', largo && 'sm:col-span-2')}>
      <span className="label">
        {rotulo}
        {obrigatorio && <span className="normal-case tracking-normal text-cinza"> (obrigatório)</span>}
        {opcional && <span className="normal-case tracking-normal text-cinza"> (opcional)</span>}
      </span>
      {children}
    </label>
  )
}

/** A aparência de chip do rádio e da caixa, lida do estado do `input` irmão (`peer`). */
function Opcao({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap border border-borda bg-branco px-5 py-3 rotulo leading-none',
        'transition-all duration-300 ease-suave hover:border-tinta',
        'peer-checked:border-tinta peer-checked:bg-tinta peer-checked:text-creme',
        'peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tinta',
      )}
    >
      {children}
    </span>
  )
}
