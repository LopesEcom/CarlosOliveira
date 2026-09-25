'use client'

import { Camera } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { comprimirImagem, tamanhoLegivel } from '../../lib/admin/comprimir-imagem'
import { BUCKET, urlDaImagem } from '../../lib/supabase/env'
import { clienteNavegador } from '../../lib/supabase/navegador'
import { cn } from '../../lib/utils'

interface EnvioFotosProps {
  /** Caminhos já salvos, na ordem. A primeira é a capa. */
  valor: string[]
  aoMudar: (caminhos: string[]) => void
  avisar: (texto: string, tom?: 'sucesso' | 'erro') => void
  /** Pasta no bucket: `pecas` para as fotos das peças, `colecoes` para as capas. */
  pasta?: string
  /** Uma foto só (a capa de uma coleção). */
  uma?: boolean
}

/**
 * AS FOTOS DE UMA PEÇA.
 * =====================
 *
 * O envio da Lennys, com o que o Carlos precisa: no celular, "Tirar ou
 * escolher fotos" abre a câmera ou a galeria. Cada foto é reduzida no próprio
 * aparelho antes de subir (4 MB viram algumas centenas de kB), então dá para
 * mandar direto da câmera, sem preparar nada.
 *
 * A primeira da lista é a capa: é ela que aparece no acervo e no cartão do
 * link no WhatsApp. Setas e arrastar trocam a ordem; as setas existem porque
 * arrastar não funciona com teclado nem, direito, no celular.
 */
export default function EnvioFotos({ valor, aoMudar, avisar, pasta = 'pecas', uma = false }: EnvioFotosProps) {
  const [enviando, setEnviando] = useState<{ nome: string; progresso: number }[]>([])
  const [sobre, setSobre] = useState(false)
  const [arrastando, setArrastando] = useState<number | null>(null)
  const entrada = useRef<HTMLInputElement>(null)

  const enviar = useCallback(
    async (arquivos: File[]) => {
      const imagens = arquivos.filter((a) => a.type.startsWith('image/')).slice(0, uma ? 1 : undefined)
      if (!imagens.length) {
        avisar('Escolha arquivos de imagem (JPG, PNG ou WEBP).', 'erro')
        return
      }

      setEnviando(imagens.map((a) => ({ nome: a.name, progresso: 0 })))
      const supabase = clienteNavegador()
      const novos: string[] = []

      for (const [i, arquivo] of imagens.entries()) {
        try {
          const foto = await comprimirImagem(arquivo)
          setEnviando((atual) => atual.map((e, j) => (j === i ? { ...e, progresso: 50 } : e)))
          // Extensão e tipo do que foi REALMENTE gerado: o Safari antigo não
          // gera webp, e a compressão cai para JPEG (ver comprimir-imagem.ts).
          const caminho = `${pasta}/${crypto.randomUUID()}.${foto.formato}`
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(caminho, foto.arquivo, { contentType: foto.arquivo.type, upsert: false })
          URL.revokeObjectURL(foto.previewUrl)

          if (error) avisar(`Não foi possível enviar "${arquivo.name}". Confira a internet e tente de novo.`, 'erro')
          else {
            novos.push(caminho)
            avisar(`Foto enviada: ${tamanhoLegivel(foto.bytesOriginais)} viraram ${tamanhoLegivel(foto.bytesFinais)}.`)
          }
        } catch (erro) {
          avisar(erro instanceof Error ? erro.message : 'Não foi possível preparar a foto.', 'erro')
        }
        setEnviando((atual) => atual.map((e, j) => (j === i ? { ...e, progresso: 100 } : e)))
      }

      setEnviando([])
      if (novos.length) aoMudar(uma ? novos.slice(0, 1) : [...valor, ...novos])
    },
    [valor, aoMudar, avisar, pasta, uma],
  )

  function mover(de: number, para: number) {
    if (para < 0 || para >= valor.length) return
    const copia = [...valor]
    const [item] = copia.splice(de, 1)
    copia.splice(para, 0, item)
    aoMudar(copia)
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setSobre(true)
        }}
        onDragLeave={() => setSobre(false)}
        onDrop={(e) => {
          e.preventDefault()
          setSobre(false)
          void enviar([...e.dataTransfer.files])
        }}
        className={cn(
          'flex flex-col items-center gap-3 border border-dashed p-6 text-center transition-colors',
          sobre ? 'border-tinta bg-borda-sutil' : 'border-borda',
        )}
      >
        <button type="button" onClick={() => entrada.current?.click()} className="btn-contorno btn-sm">
          <Camera size={16} strokeWidth={1.5} aria-hidden />
          {uma ? (valor.length ? 'Trocar a foto' : 'Escolher a foto') : 'Tirar ou escolher fotos'}
        </button>
        <p className="text-xs text-cinza">
          {uma ? 'Uma foto só.' : 'Pode escolher várias de uma vez.'} Reduzimos o tamanho sozinhos. No computador, dá para
          arrastar as fotos para cá.
        </p>
        <input
          ref={entrada}
          type="file"
          accept="image/*"
          multiple={!uma}
          tabIndex={-1}
          aria-label="Escolher fotos"
          className="sr-only"
          onChange={(e) => {
            void enviar([...(e.target.files ?? [])])
            e.target.value = ''
          }}
        />
      </div>

      {enviando.length > 0 && (
        <ul aria-live="polite" className="flex flex-col gap-2">
          {enviando.map((e) => (
            <li key={e.nome}>
              <span className="text-xs text-cinza">Enviando {e.nome}</span>
              <div className="mt-1 h-1 w-full bg-borda-sutil">
                <div className="h-full bg-tinta transition-all duration-300" style={{ width: `${e.progresso}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {valor.length > 0 ? (
        <ul className={cn('grid gap-3', uma ? 'max-w-[10rem]' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5')}>
          {valor.map((caminho, i) => (
            <li
              key={caminho}
              draggable={!uma}
              onDragStart={() => setArrastando(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (arrastando !== null) mover(arrastando, i)
                setArrastando(null)
              }}
              className={cn('flex flex-col gap-1.5', arrastando === i && 'opacity-50')}
            >
              <div className="relative aspect-[3/4] overflow-hidden border border-borda bg-borda-sutil">
                <img src={urlDaImagem(caminho)} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                {i === 0 && !uma && <span className="rotulo-sm absolute left-0 top-0 bg-tinta px-2 py-1 text-creme">Capa</span>}
              </div>
              <div className="flex items-center justify-between gap-1">
                {!uma && (
                  <div className="flex gap-1">
                    <BotaoMover rotulo={`Mover a foto ${i + 1} para trás`} simbolo="←" desligado={i === 0} aoClicar={() => mover(i, i - 1)} />
                    <BotaoMover
                      rotulo={`Mover a foto ${i + 1} para a frente`}
                      simbolo="→"
                      desligado={i === valor.length - 1}
                      aoClicar={() => mover(i, i + 1)}
                    />
                  </div>
                )}
                {/* Só sai da lista. O arquivo continua no bucket até a peça ser
                    excluída: apagar aqui perderia a foto se o Carlos desistir
                    e sair sem salvar. */}
                <button
                  type="button"
                  onClick={() => aoMudar(valor.filter((_, j) => j !== i))}
                  className="text-xs text-cinza underline underline-offset-2 hover:text-erro"
                >
                  Tirar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-cinza">
          {uma ? 'Sem foto, a coleção usa a da primeira peça dela.' : 'Sem foto, a peça fica guardada aqui mas não aparece no site.'}
        </p>
      )}
    </div>
  )
}

function BotaoMover({ rotulo, simbolo, desligado, aoClicar }: { rotulo: string; simbolo: string; desligado: boolean; aoClicar: () => void }) {
  return (
    <button
      type="button"
      disabled={desligado}
      onClick={aoClicar}
      className="flex size-8 items-center justify-center border border-borda text-sm hover:border-tinta disabled:opacity-30"
    >
      <span aria-hidden>{simbolo}</span>
      <span className="sr-only">{rotulo}</span>
    </button>
  )
}
