# Como o site foi construído

Documento de arquitetura: o que foi decidido, por quê, e onde cada decisão mora
no código. Para instruções de operação (trocar telefone, adicionar peça, subir
para a Vercel), veja o [README](README.md).

---

## 1. O escopo, e a decisão que define tudo

O site é uma **vitrine estática**, não uma loja. Não há carrinho, checkout,
preço, estoque nem conta de usuário. A peça é exibida e a conversa continua no
WhatsApp, com a mensagem já preenchida com o nome da peça e a categoria.

Essa decisão é a raiz de todas as outras. Sem transação não há necessidade de
backend, banco, autenticação ou painel administrativo. O que sobra é um site
que precisa ser **rápido, bonito e fácil de editar por uma pessoa só**. Toda a
arquitetura abaixo é consequência disso.

Consequência prática: o conteúdo vive em arquivos TypeScript versionados no
Git, não num CMS. Editar o catálogo é editar um array e fazer commit. Em troca
de um pouco de fricção para quem edita, ganha-se site sem custo de servidor,
sem tela de login, sem banco para migrar e com histórico completo de mudanças.

---

## 2. Stack

| camada | escolha | motivo |
| --- | --- | --- |
| build | Vite 8 | build de 2 a 3 segundos, HMR instantâneo |
| UI | React 19 | metadados nativos no `<head>`, sem react-helmet |
| tipos | TypeScript 6 | o catálogo é dado estruturado; o compilador pega erro de categoria e caminho |
| estilo | Tailwind CSS 3.4 | o design system vira restrição, não sugestão |
| rotas | React Router 7 | quatro rotas, com filtro na query string |
| ícones | lucide-react | traço fino, combina com a tipografia |
| imagens | sharp | conversão para WebP em script local, fora do build |
| lint | oxlint | padrão do create-vite 9, roda em milissegundos |

**Tailwind 3.4 e não a 4.** A versão 4 move a configuração para dentro do CSS.
O projeto foi especificado com `tailwind.config.ts` e `theme.extend`, e a 3.4 é
a última que entrega exatamente esse formato. Foi escolha deliberada, não
atraso de versão.

**Sem biblioteca de componentes.** Nada de shadcn, MUI ou Chakra. O visual é
específico demais: raio zero em tudo, sombras quase invisíveis, versalete com
entrelinha larga. Adaptar uma biblioteca genérica custaria mais do que escrever
os oito componentes que o site realmente usa.

---

## 3. Como o projeto está organizado

```
public/
  pecas/            73 fotos em WebP
  atelier/          retrato da Simone, embalagens, certificado INPI
  og-image.jpg      preview ao compartilhar link (1200x630)
  favicon.png · apple-touch-icon.png · logo-*.webp

src/
  data/             CONTEÚDO: pecas · google · casamentos · youtube · faq
  lib/              brand.ts (contatos) · utils.ts · diagnosticoOverflow.ts
  components/       casca e blocos reutilizáveis
  pages/            Home · Catalogo · Peca · Sobre · NaoEncontrada
  index.css         design tokens e classes de componente
tailwind.config.ts  mapeia os tokens para as utilities
vercel.json         rewrite de SPA
scripts/webp.mjs    conversão de imagem
```

A separação que importa é **`data/` versus todo o resto**. Quem for mexer no
conteúdo do site mexe só em `src/data/`. Nenhum componente tem número de
telefone, `@` do Instagram ou nome de peça escrito direto no meio do JSX.

---

## 4. Design system

Tudo começa em `src/index.css`, no bloco `:root`. O `tailwind.config.ts` não
define cor nenhuma: ele só aponta para as variáveis. Fonte única de verdade.

### As cores são trios de canais, e isso não é decoração

```css
--preto-rgb: 28 28 28;           /* trio de canais, sem vírgula */
--preto: rgb(var(--preto-rgb));  /* versão pronta para CSS puro */
```

```ts
preto: 'rgb(var(--preto-rgb) / <alpha-value>)'
```

Esse é o único formato em que o Tailwind consegue injetar transparência. Com
hex dentro da variável, `text-preto/70` e `bg-preto/50` **falham em silêncio**:
não dão erro, não aparecem no console, simplesmente saem sólidos ou
transparentes. O projeto foi construído inteiro com hex antes de isso ser
descoberto, e metade dos gradientes e sobreposições estava invisível. Se um dia
uma cor for trocada, converta o hex para os três canais decimais.

### A paleta é estritamente preto e branco

Não existe cor de acento. Havia dourado no começo, e ele foi removido a pedido.
A hierarquia visual vem de **peso e preenchimento**, não de matiz: botão cheio
contra botão de contorno, preto sobre off-white contra branco sobre preto.

O `--cinza` (`#696969`) é o preto rebaixado para rótulos e texto de apoio. Não
foi escolhido no olho: é o cinza mais claro que ainda cumpre 4,5:1 sobre
off-white. Todos os pares de cor do site foram medidos por script; os 24 pares
passam em WCAG AA.

### Tipografia e forma

- **Cormorant Garamond** nos títulos, em versalete com `letter-spacing: 0.18em`.
- **Instrument Sans** no corpo.
- Escala de h1 a h6 em `clamp()`, então o tipo cresce com a tela sem breakpoint.
- `border-radius: 0` em absolutamente tudo. A **única** exceção do site inteiro
  é o botão flutuante do WhatsApp, que é redondo por convenção da plataforma.
- Sombras quase invisíveis (5% e 7% de opacidade). O que separa os blocos é
  espaço e filete, não elevação.

---

## 5. A camada de dados

`src/data/pecas.ts` é o coração. Cada peça é um objeto:

```ts
{
  slug: 'noiva-kelly',           // vira a URL /peca/noiva-kelly
  nome: 'Kelly',                 // o nome da CLIENTE que vestiu
  categoria: 'noiva',            // noiva | festa | debutante | infantil | casual
  descricao: 'Romântico, Minimalista e Contemporâneo',
  imagens: ['/pecas/kelly-...webp', '/pecas/kelly-...2.webp'],
  destaque: true,                // opcional, aparece na home
}
```

Duas convenções nasceram de conversa com a Simone e valem registro:

**O título da peça é o nome da cliente.** Não "Vestido de noiva em renda". Cada
peça é única e foi feita para uma pessoa, e o site fica mais forte dizendo isso.
Os arquivos de imagem seguem o mesmo padrão, `cliente-estilo.webp`, o que faz o
nome do arquivo carregar o dado em vez de depender só do código.

**A descrição não cita tecido.** Nem sempre há certeza de qual foi usado, e
chutar na descrição de uma peça sob medida é pior do que não dizer. O campo
`tecido` existiu e foi removido do tipo. A descrição é o estilo, em uma linha,
como ela descreve.

### O resto do site se deriva daí

Ninguém mantém lista de categoria em dois lugares:

```ts
export const pecasDestaque       // filtra destaque: true
export const categoriasDisponiveis  // só categorias que têm peça
export const categoriasVitrine   // capa (1ª imagem) + contagem, para a home
export function pecasPorCategoria(c)
export function buscarPeca(slug)
```

Adicionar uma peça de uma categoria nova faz o chip aparecer no filtro e o card
aparecer na vitrine da home, sem tocar em componente nenhum. Foi assim que a
troca de "sob medida" por "casual" custou poucas linhas.

Os outros arquivos de `data/` seguem a mesma ideia: `google.ts` (perfil e 20
avaliações transcritas), `casamentos.ts` (4), `youtube.ts` (5 shorts),
`faq.ts` (3 perguntas).

---

## 6. Rotas e carregamento

Quatro rotas, e cada página é um `React.lazy`:

```tsx
<Route element={<Layout />}>
  <Route index element={<Home />} />
  <Route path="catalogo" element={<Catalogo />} />
  <Route path="peca/:slug" element={<Peca />} />
  <Route path="sobre" element={<Sobre />} />
  <Route path="*" element={<NaoEncontrada />} />
</Route>
```

O `<Suspense>` fica **dentro do Layout, em volta do `<Outlet />`**, e não em
volta das `<Routes>`. A diferença é visível: com ele por fora, header e rodapé
sumiriam e voltariam a cada troca de rota. Do jeito que está, a casca fica
parada e só o miolo troca. O fallback reserva `60svh` de altura para o rodapé
não saltar enquanto o chunk baixa.

### O filtro do catálogo mora na URL

`useSearchParams` é a fonte de verdade, não `useState`:

```ts
const filtroAtivo = ehCategoria(params.get('categoria')) ? ... : null
```

Isso resolve três coisas de uma vez: os cards da home entram direto filtrados
(`/catalogo?categoria=noiva`), o botão voltar do navegador funciona, e o link
filtrado pode ser compartilhado. O `ehCategoria` é um type guard: categoria
desconhecida na URL cai em "Todas" em vez de quebrar a página.

---

## 7. As três seções que fecham toda página

Ficam no `Layout`, dentro do `<main>`, depois do `<Outlet />`:

```tsx
<SecaoAvaliacoes />   {/* prova social */}
<Faq />               {/* dúvidas */}
<SecaoMapa />         {/* onde encontrar */}
```

A ordem é intencional: convence, tira a dúvida, diz onde fica. Repetem em todas
as rotas porque em site de vitrine não se controla por onde a visita entra, e
qualquer página precisa conseguir fechar sozinha.

`SecaoGoogle.tsx` exporta dois componentes justamente para o FAQ poder ficar no
meio dos dois. As avaliações rolam na horizontal, com cards de largura em `rem`
(nunca `vw`, ver §11) e o carrossel dentro de um contêiner com `overflow-hidden`.

**A seção do YouTube usa fachada.** Em vez de carregar cinco iframes do YouTube
(cada um custa centenas de KB e cookies de rastreamento), mostra a thumbnail e
só troca pelo iframe do `youtube-nocookie.com` depois do clique.

---

## 8. Imagens

**Toda foto mora em `public/`, nunca em `src/assets/`.** Caminho em texto
(`'/pecas/kelly.webp'`) só funciona a partir de `public/`. Em `src/assets/` o
Vite exige `import` para versionar o arquivo, e a string vira link quebrado no
build. Como as fotos vêm de um array de dados, `public/` é a única opção viável.

**Tudo é WebP**, convertido por `npm run webp` (`scripts/webp.mjs`, usando
sharp). O script varre `public/`, converte jpg/jpeg/png, apaga o original e
imprime a economia. Preserva três arquivos de propósito: `og-image.jpg`,
`favicon.png` e `apple-touch-icon.png`, porque robô de preview e ícone de
sistema nem sempre entendem WebP. Hoje são 73 imagens somando 6,7 MB, média de
94 KB. As conversões costumam cortar de 90% a 96% do peso.

**As fotos são exibidas em 3:4** (`aspect-[3/4] object-cover`), no card e na
galeria. Isso significa que foto muito vertical perde altura no corte: uma foto
1:2,6 mostra só 51% de si mesma, o que na prática corta cabeça e barra do
vestido. Quando isso acontece e não há foto melhor, a saída usada foi preencher
as laterais com uma versão desfocada e escurecida da própria imagem até chegar
em 3:4, em vez de cortar a peça. É o caso de `marcia-classico-e-elegante.webp`.

---

## 9. SEO em duas camadas

O problema: o site é uma SPA sem servidor, e **os robôs de preview do WhatsApp,
Facebook e Instagram não executam JavaScript**. O Google executa.

A solução são duas camadas:

1. **Estática, no `index.html`.** Open Graph completo com URLs absolutas. É o
   que os robôs de preview leem. Toda tag dessa camada carrega o atributo
   `data-seo-estatico`.
2. **Por rota, no `<Seo>`.** React 19 eleva `<title>` e `<meta>` para o `<head>`
   sozinho, então não há react-helmet. Serve ao Google.

O detalhe que faz a coisa funcionar está em `main.tsx`:

```ts
document.querySelectorAll('[data-seo-estatico]').forEach((tag) => tag.remove())
```

Sem essa linha o documento fica com **duas** `<meta name="description">`, e o
Google considera a primeira, que é a estática e genérica. Ou seja: as descrições
por página seriam escritas e ignoradas. A limpeza roda antes do primeiro render.

**Limite conhecido:** compartilhar o link de uma peça específica mostra o
preview genérico do atelier, não a foto daquela peça. Resolver isso exige
pré-renderizar as rotas no build (`vite-plugin-ssg` ou similar), o que mantém o
site estático e na Vercel. Ficou de fora por não ser prioridade.

**SEO local:** o site não dizia a cidade em lugar nenhum. Hoje "Timóteo, MG"
aparece nas meta descriptions, no bloco do mapa e no rodapé, com endereço,
horário e nota do perfil do Google.

---

## 10. Acessibilidade, performance e deploy

**Acessibilidade.** Contraste medido por script (24 de 24 pares em AA), `alt`
descritivo em toda imagem de conteúdo e `alt=""` nas decorativas, carrossel com
`role="region"` e `tabIndex`, foco visível, hierarquia de heading sem pular
nível, e `<span className="sr-only">` onde o rótulo visual não basta.

**Performance.** Números do build atual:

```
index.html                    3,11 kB  │ gzip:  1,10 kB
CSS                          25,18 kB  │ gzip:  5,67 kB
runtime + vendor            209,28 kB  │ gzip: 66,92 kB
Home                         14,02 kB  │ gzip:  4,61 kB
Catalogo                      2,69 kB  │ gzip:  1,28 kB
Peca                          4,53 kB  │ gzip:  1,80 kB
```

Quem abre a home baixa o chunk da home, não o catálogo inteiro. Fontes com
`preconnect` e `display=swap`. `loading="lazy"` e `decoding="async"` em tudo,
menos nas duas primeiras imagens da home, que entram com prioridade.

**Deploy.** Estático na Vercel, build `npm run build`, saída `dist/`. O
`vercel.json` tem uma linha que é indispensável:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Sem ela, abrir `/catalogo` direto ou dar F5 em `/peca/noiva-kelly` daria 404: o
servidor procuraria um arquivo nesse caminho, que não existe, porque o
roteamento é todo do lado do cliente.

---

## 11. Armadilhas encontradas no caminho

Vale registrar, porque custaram tempo e voltariam a custar.

**`tailwind.config.ts` não recarrega a quente.** Mudou o config, reinicie o
`npm run dev`. Sem isso a alteração parece não ter efeito e leva a diagnóstico
errado.

**Alpha modifier com hex falha em silêncio.** Já descrito na §4. É o tipo de
bug que não aparece em erro nenhum, só no visual.

**`overflow-x: clip`, e não `hidden`, no `html`.** `overflow: hidden` na raiz
transforma o elemento em contêiner de rolagem e **quebra o `position: sticky`**
do cabeçalho. `clip` prende a largura sem esse efeito colateral. Ressalva: o
Safari anterior à 16 ignora `clip`, então isso é uma barreira, não a única.

**Nunca dimensione elemento em `vw` dentro de contêiner rolável.** `100vw`
inclui a barra de rolagem e vira estouro horizontal. Os cards do carrossel usam
`rem`.

**iOS Safari dimensiona iframe pelo conteúdo** e ignora largura percentual. O
contorno usado nos dois iframes do site é `w-px min-w-full` mais um wrapper com
`overflow-hidden`.

**A capa de Short do YouTube mente.** `oardefault.jpg` responde **200** com um
placeholder cinza de 120x90 para vídeo sem capa vertical, então `onError` nunca
dispara. A detecção real é testar `naturalWidth <= 120` no `onLoad`.

**Não rode regex em massa sobre arquivo-fonte pelo PowerShell.** Um substituto
mal escapado corrompeu sete arquivos de uma vez neste projeto. Edição de código
é feita arquivo a arquivo.

---

## 12. Diagnóstico embutido

`src/lib/diagnosticoOverflow.ts` existe por um motivo específico: houve relato
de rolagem lateral no aparelho da cliente que não se reproduzia em teste. O
módulo é carregado por `?overflow` na URL, por import dinâmico, então vira um
chunk de 2 kB que **visitante nenhum baixa**. Ligado, ele desenha um painel na
própria tela listando os elementos que passam da largura da viewport, contorna
em vermelho os não contidos e tenta rolar a página para provar se ela de fato
se move.

Quando o problema for confirmado resolvido, este arquivo, a chamada em
`main.tsx` e esta seção podem sair.

---

## 13. Em aberto

- **`SITE_URL`** em `src/lib/brand.ts` ainda é um endereço inventado da Vercel.
  As URLs canônicas e de Open Graph só ficam corretas depois de apontar para o
  domínio real, e as absolutas do `index.html` precisam acompanhar.
- **As respostas do FAQ** são suposições (prazo de 45 dias, três provas,
  atendimento com hora marcada) e precisam de confirmação da Simone.
- **Três estilos** (Geovana, Antônio Miguel, Henrique) foram escritos aqui,
  porque os arquivos de imagem trazem só o nome. Estão sinalizados em comentário
  no topo de `pecas.ts`.
- **O texto institucional da página Sobre** também foi escrito aqui e ganharia
  em ser reescrito na voz dela, agora que o manifesto dos 30 anos está no site.
- **Preview por peça** ao compartilhar link, ver §9.
- **`isis-romantico1.webp`** perde 35% da altura no corte 3:4 e renderia mais
  com o tratamento descrito na §8.
