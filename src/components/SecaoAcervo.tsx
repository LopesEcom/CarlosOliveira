import { Plus } from 'lucide-react'
import Link from 'next/link'

import type { Colecao, Peca } from '../lib/tipos'
import CapasColecoes from './CapasColecoes'
import GradeObras from './GradeObras'
import Revelar from './Revelar'

/** Quantas peças a vitrine do início mostra. Duas fileiras de quatro. */
const NA_VITRINE = 8

/**
 * Bloco 4 do início, A VITRINE.
 * =============================
 *
 * Os destaques que o Carlos marca no painel, as capas das coleções e a porta
 * para o acervo inteiro (com filtros, busca e preço). O "+" continua em cada
 * peça: quem já achou o que queria aqui não precisa ir ao acervo para montar
 * a mensagem.
 */
export default function SecaoAcervo({ pecas, colecoes }: { pecas: Peca[]; colecoes: Colecao[] }) {
  /* Os destaques primeiro; se forem poucos, completa com as outras, na ordem
     do acervo, para a vitrine nunca ficar com fileira pela metade. */
  const vitrine = [...pecas.filter((p) => p.destaque), ...pecas.filter((p) => !p.destaque)].slice(0, NA_VITRINE)

  return (
    <section id="acervo" className="scroll-mt-20 border-t border-borda-sutil bg-branco">
      <div className="container-site secao-g">
        <div className="u-grid items-end">
          <div className="col-6">
            <Revelar>
              <span className="eyebrow block">O acervo</span>
              <h2 className="mt-4 texto-display-sm">Escolha o que te chamou</h2>
              <span className="filete mt-7" />
            </Revelar>
          </div>
          <div className="col-4 deslocar-8">
            <Revelar atraso={120}>
              <p className="text-tinta/70">
                Toque no <Plus size={14} strokeWidth={2} className="inline -translate-y-px" aria-hidden />{' '}
                das peças que você gostou. No fim, elas vão juntas numa mensagem
                só para o Carlos.
              </p>
            </Revelar>
          </div>
        </div>

        <GradeObras pecas={vitrine} className="mt-14" />

        {colecoes.length > 0 && (
          <div className="mt-24">
            <Revelar>
              <span className="eyebrow block">Coleções</span>
              <h2 className="mt-4 texto-display-sm">Pelo lugar da casa</h2>
            </Revelar>
            <CapasColecoes colecoes={colecoes} pecas={pecas} className="mt-10" />
          </div>
        )}

        <Revelar>
          <div className="mt-16 flex flex-col items-center gap-6 text-center">
            <Link href="/acervo" className="btn-primario">
              Ver o acervo inteiro
            </Link>
            <p className="max-w-md text-sm text-tinta/60">
              Aqui estão {pecas.length} das mais de trezentas peças da oficina. Não
              achou o tema que queria? Pergunte ao Carlos: é bem capaz de já existir.
            </p>
          </div>
        </Revelar>
      </div>
    </section>
  )
}
