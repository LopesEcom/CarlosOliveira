import Capa from '../../components/Capa'
import DeslizeObras from '../../components/DeslizeObras'
import Faq from '../../components/Faq'
import SecaoAcervo from '../../components/SecaoAcervo'
import SecaoBancada from '../../components/SecaoBancada'
import SecaoEncomenda from '../../components/SecaoEncomenda'
import SecaoEscola from '../../components/SecaoEscola'
import SecaoLivro from '../../components/SecaoLivro'
import SecaoOficina from '../../components/SecaoOficina'
import { getColecoes, getPecas } from '../../lib/dados/consultas'

export const metadata = {
  description:
    'Carlos Oliveira, escultor entalhador: mais de 300 peças entalhadas à mão em madeira maciça, entre arte sacra, bichos, figuras, relógios e molduras. Peças prontas e sob encomenda.',
  alternates: { canonical: '/' },
}

/**
 * O INÍCIO.
 * =========
 *
 * Mostrar que a mão é dele, mostrar as peças e devolver a pessoa ao WhatsApp
 * com a escolha feita. Cada bloco também é a porta para a página inteira do
 * assunto.
 *
 *   1  Capa        a foto dele, a frase e o nome colossal
 *   2  Oficina     o vídeo na bancada e os números      → /historia
 *   3  Deslize     quatro destaques atravessando a tela  → /peca/…
 *   4  Vitrine     destaques e coleções                  → /acervo
 *   5  Bancada     três vídeos curtos de entalhe
 *   6  Livro       a autobiografia e o manual            → /livro
 *   7  Escola      o anúncio da escola de entalhadores   → /escola
 *   8  Encomenda   para quem não achou o que queria
 *   9  Dúvidas
 */
export default async function Inicio() {
  const [pecas, colecoes] = await Promise.all([getPecas(), getColecoes()])

  return (
    <>
      <Capa />
      <SecaoOficina comLinkHistoria />
      <DeslizeObras obras={pecas.filter((p) => p.destaque)} />
      <SecaoAcervo pecas={pecas} colecoes={colecoes} />
      <SecaoBancada />
      <SecaoLivro />
      <SecaoEscola />
      <SecaoEncomenda />
      <Faq />
    </>
  )
}
