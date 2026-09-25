import BotaoWhatsapp from './BotaoWhatsapp'
import Revelar from './Revelar'

const PASSOS = [
  { titulo: 'A ideia', texto: 'Você manda a referência e as medidas do lugar onde a peça vai ficar.' },
  { titulo: 'A madeira', texto: 'O Carlos escolhe o bloco certo para o desenho e te diz o prazo de verdade.' },
  { titulo: 'O entalhe', texto: 'Ele entalha a sua peça no formão, do primeiro corte ao acabamento.' },
]

/**
 * Bloco 7, ENCOMENDAS.
 *
 * Para quem viu o acervo e quer outra coisa: a imagem da própria devoção, o
 * painel do tamanho da parede. Três passos numa régua, e o convite em
 * itálico, a voz da casa, fechando a coluna.
 */
export default function SecaoEncomenda() {
  return (
    <section className="border-t border-borda-sutil bg-branco">
      <div className="container-site secao-g">
        <div className="u-grid">
          <div className="col-5">
            <Revelar>
              <span className="eyebrow block">Sob encomenda</span>
              <h2 className="mt-4 texto-display-sm">
                Não achou? Ele entalha.
              </h2>
              <span className="filete mt-7" />
              <p className="t-italico mt-8 max-w-[26ch]">
                A imagem da sua devoção, o painel do tamanho da sua parede.
              </p>
              <BotaoWhatsapp
                className="mt-10"
                mensagem="Olá, Carlos! Vim pelo seu site e gostaria de um orçamento para uma peça sob encomenda."
              >
                Pedir um orçamento
              </BotaoWhatsapp>
            </Revelar>
          </div>

          <ol className="col-6 deslocar-7 mt-8 grid gap-10 self-end md:mt-0">
            {PASSOS.map((passo, indice) => (
              <Revelar key={passo.titulo} como="li" atraso={indice * 110} className="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-borda pt-6">
                <span className="font-display text-[2.75rem] font-normal leading-none text-tinta/40">
                  {String(indice + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-h5">{passo.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-tinta/70">{passo.texto}</p>
                </div>
              </Revelar>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
