# Atelier Simone Sá — vitrine

Catálogo estático de alta-costura sob medida. Sem carrinho e sem checkout: as peças
são exibidas em vitrine e todo contato acontece pelo WhatsApp, com a mensagem já
preenchida conforme a peça.

React + Vite + TypeScript + Tailwind CSS. Sem backend.

---

## Rodar localmente

```bash
npm install
```

```bash
npm run dev
```

Abre em `http://localhost:5173`.

| comando | o que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera a pasta `dist/` para produção |
| `npm run preview` | serve o `dist/` para conferir antes do deploy |
| `npm run lint` | roda o oxlint |

> Ao alterar `tailwind.config.ts`, **reinicie o `npm run dev`** — esse arquivo não
> recarrega a quente e as mudanças só aparecem depois do restart.

---

## Trocar WhatsApp, Instagram e domínio

Tudo em **`src/lib/brand.ts`**. Nenhum componente tem número ou @ escrito direto.

```ts
export const brand = {
  nome: 'Simone Sá',
  subtitulo: 'Atelier',
  instagram: '@simonesa.atelier',  // ← seu @ real
  whatsapp: '5500000000000',       // ← 55 + DDD + número, só dígitos
  cidade: '',
  email: '',
}

export const SITE_URL = 'https://simone-sa-atelier.vercel.app' // ← domínio real
```

O WhatsApp usa **formato internacional, apenas dígitos**: `55` + DDD + número,
sem `+`, espaço, parêntese ou traço. Exemplo para (11) 98765-4321 →
`5511987654321`.

Ao trocar o `SITE_URL`, atualize também as URLs absolutas de Open Graph no
`index.html` (explicação abaixo).

---

## Adicionar ou editar peças

Tudo em **`src/data/pecas.ts`**. Cada peça é um objeto no array `pecas`:

```ts
{
  slug: 'vestido-noiva-renda-francesa',  // vira a URL /peca/vestido-noiva-renda-francesa
  nome: 'Vestido de noiva em renda francesa',
  categoria: 'noiva',                    // noiva | festa | debutante
                                         // infantil | sob-medida
  descricao: 'Duas ou três frases sobre a peça.',
  tecido: 'renda francesa e tule',       // opcional
  imagens: ['/pecas/noiva-renda-1.jpg', '/pecas/noiva-renda-2.jpg'],
  destaque: true,                        // opcional — aparece na home
}
```

O `slug` precisa ser único e sem acento ou espaço — é o endereço da página.

O site se atualiza sozinho a partir desse arquivo: a home escolhe os destaques,
a vitrine de categorias monta as capas e a contagem, e o catálogo gera os
filtros só das categorias que têm peça.

Todo o catálogo é sob medida: cada peça exibe o bloco "Peça sob medida" e o
botão manda no WhatsApp *"Olá! Tenho interesse na peça {nome}. Gostaria de um
orçamento sob medida."*

Os depoimentos ficam em `src/data/depoimentos.ts` e as avaliações do Google em
`src/data/google.ts`.

---

## Onde colocar as imagens

Na pasta **`public/pecas/`**. No código, referencie com caminho começando em
barra: `/pecas/nome-do-arquivo.jpg`.

```
public/
  pecas/
    adele-1.jpg              →  imagens: ['/pecas/adele-1.jpg']
  og-image.jpg               →  preview ao compartilhar o link (1200×630)
  favicon.png                →  ícone da aba
  apple-touch-icon.png       →  ícone ao salvar na tela inicial do iPhone
  logo-simbolo.png           →  símbolo preto — usado no header
  logo-simbolo-claro.png     →  símbolo branco — para fundo escuro
  logo-completo.png          →  lockup preto (símbolo + nome)
  logo-completo-claro.png    →  lockup branco — usado no rodapé
  logo-original.jpg          →  arquivo original enviado, sem tratamento
```

### Sobre os arquivos da logo

O original (`logo-original.jpg`) é preto sobre fundo branco. As versões em PNG
foram recortadas e tiveram o fundo tornado transparente, para assentar sobre
qualquer cor sem o retângulo branco aparecer.

O header usa **só o símbolo** e escreve "SIMONE SÁ / ATELIER" com a tipografia do
site. Motivo: a logo original é vertical (símbolo em cima, nome embaixo) e,
reduzida à altura do header, o nome dela ficaria com cerca de 5 px — ilegível.
No rodapé, onde há espaço para ~160 px, o lockup completo é usado.

Se um dia você tiver a logo em **SVG** ou numa versão **horizontal**, ela rende
mais: substitua `logo-simbolo.png` no `Header.tsx` e ganhe nitidez em telas
retina.

**Não use `src/assets` para as fotos das peças.** Caminho em texto só funciona a
partir de `public/`; em `src/assets` o Vite exige `import` e a imagem some no
build.

Recomendações: proporção retrato **3:4** (as fotos são exibidas nesse formato),
largura de 1200–1600 px, JPG otimizado abaixo de ~300 KB.

As fotos atuais em `public/pecas/placeholder-01..12.jpg` são provisórias.
Para trocar, basta substituir os arquivos mantendo o nome, ou renomear e
atualizar `pecas.ts`.

---

## Deploy na Vercel

O projeto é 100% estático.

1. Suba o repositório para o GitHub.
2. Na Vercel, **Add New → Project** e importe o repositório.
3. A Vercel detecta Vite sozinha. Confirme:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy.

O `vercel.json` já está no projeto com o rewrite que faz `/catalogo`, `/sobre` e
`/peca/:slug` funcionarem quando acessados direto ou recarregados — sem ele,
essas URLs dariam 404.

Depois do deploy, atualize `SITE_URL` em `src/lib/brand.ts` e as URLs de Open
Graph no `index.html` com o domínio real.

---

## Nota sobre o preview de links

Os robôs do WhatsApp, Facebook e Instagram **não executam JavaScript**. Como o
site é uma SPA sem servidor, eles leem apenas as tags que estão no `index.html`.

Na prática:

- Compartilhar **qualquer link** do site mostra o preview do atelier
  (`og-image.jpg`, título e descrição gerais). Funciona.
- Compartilhar o link de **uma peça específica** mostra esse mesmo preview
  genérico, e não a foto e o nome daquela peça.

O componente `<Seo>` define título e descrição por página corretamente para o
Google, que executa JavaScript. Se um dia o preview por peça for importante,
o caminho é pré-renderizar as rotas no build (`vite-plugin-ssg` ou similar) —
continua estático e continua na Vercel.

---

## Estrutura

```
public/pecas/        fotos das peças
src/
  components/        Header, Footer, CardPeca, GaleriaPeca, BotaoWhatsapp, Seo…
  data/              pecas.ts · depoimentos.ts   ← conteúdo do site
  lib/               brand.ts (contatos) · utils.ts
  pages/             Home · Catalogo · Peca · Sobre · NaoEncontrada
  index.css          design system (tokens + componentes)
tailwind.config.ts   mapeia os tokens para o Tailwind
```

### Sobre as cores

As cores ficam em `src/index.css` como **trio de canais RGB**, não hex:

```css
--preto-rgb: 28 28 28;           /* #1C1C1C */
--preto: rgb(var(--preto-rgb));  /* pronto para CSS puro */
```

É o único formato em que o Tailwind consegue aplicar opacidade — sem ele,
`text-preto/70` é silenciosamente ignorado. Para trocar uma cor, converta o hex
para os três canais decimais.

A paleta é estritamente **preto e branco** — não há cor de acento. A hierarquia
vem de peso e preenchimento (botão cheio x contorno), não de matiz. O
`--cinza` (`#696969`) é o preto rebaixado usado em rótulos e texto secundário;
é o mais claro que ainda cumpre 4,5:1 sobre off-white.

Sobre fundo escuro use as variantes claras: `.filete-claro`,
`.btn-contorno-claro` e a prop `variante="claro"` do `BotaoWhatsapp`.
