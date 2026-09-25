import type { DiaDeCliques } from '../../lib/admin/consultas'

const LARGURA = 720
const ALTURA = 180
const MARGEM = { topo: 12, direita: 8, baixo: 22, esquerda: 28 }

const rotuloDia = (iso: string) => {
  const [, mes, dia] = iso.split('-')
  return `${dia}/${mes}`
}

/**
 * Cliques no WhatsApp por dia, nos últimos 30 dias. O mesmo gráfico do
 * painel da Lennys: SVG à mão, porque é uma linha só e uma biblioteca de
 * gráficos não se paga. Os números também vão numa tabela escondida, para
 * leitor de tela.
 */
export default function Grafico({ dados }: { dados: DiaDeCliques[] }) {
  const maximo = Math.max(1, ...dados.map((d) => d.cliques))
  const larguraUtil = LARGURA - MARGEM.esquerda - MARGEM.direita
  const alturaUtil = ALTURA - MARGEM.topo - MARGEM.baixo
  const passo = dados.length > 1 ? larguraUtil / (dados.length - 1) : 0
  const x = (i: number) => MARGEM.esquerda + i * passo
  const y = (v: number) => MARGEM.topo + alturaUtil - (v / maximo) * alturaUtil
  const linha = dados.map((d, i) => `${x(i)},${y(d.cliques)}`).join(' ')
  const base = MARGEM.topo + alturaUtil
  const area = `${MARGEM.esquerda},${base} ${linha} ${x(dados.length - 1)},${base}`
  const marcas = [0, Math.floor(dados.length / 2), dados.length - 1]

  return (
    <figure>
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="w-full"
        role="img"
        aria-label={`Cliques no WhatsApp por dia nos últimos ${dados.length} dias. Máximo de ${maximo} num dia.`}
      >
        {[0, maximo / 2, maximo].map((valor) => (
          <g key={valor}>
            <line x1={MARGEM.esquerda} x2={LARGURA - MARGEM.direita} y1={y(valor)} y2={y(valor)} stroke="var(--borda)" />
            <text x={MARGEM.esquerda - 6} y={y(valor) + 3} textAnchor="end" fontSize="9" fill="var(--cinza)">
              {Math.round(valor)}
            </text>
          </g>
        ))}
        <polygon points={area} fill="var(--tinta)" opacity="0.06" />
        <polyline points={linha} fill="none" stroke="var(--tinta)" strokeWidth="1.5" strokeLinejoin="round" />
        {dados.map((d, i) =>
          d.cliques > 0 ? (
            <circle key={d.dia} cx={x(i)} cy={y(d.cliques)} r="2.5" fill="var(--tinta)">
              <title>{`${rotuloDia(d.dia)}: ${d.cliques} clique${d.cliques === 1 ? '' : 's'}`}</title>
            </circle>
          ) : null,
        )}
        {marcas.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={ALTURA - 6}
            textAnchor={i === 0 ? 'start' : i === dados.length - 1 ? 'end' : 'middle'}
            fontSize="9"
            fill="var(--cinza)"
          >
            {rotuloDia(dados[i].dia)}
          </text>
        ))}
      </svg>
      <figcaption className="sr-only">
        <table>
          <caption>Cliques no WhatsApp por dia</caption>
          <tbody>
            {dados.map((d) => (
              <tr key={d.dia}>
                <th scope="row">{rotuloDia(d.dia)}</th>
                <td>{d.cliques}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}
