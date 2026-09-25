# CLAUDE.md

Contexto para o Claude Code continuar este projeto. Leia o `README.md` primeiro:
lá estão o cliente, os fatos confirmados, as etapas e as pendências.

## Em uma frase

Site de marca do escultor **Carlos Oliveira** (72 anos, mestre entalhador,
mais de 300 peças): uma vitrine refinada que fecha a venda no **WhatsApp** e,
no futuro, recebe inscrições para a **escola de entalhadores** dele. O
trabalho segue nove etapas. O código das etapas 3 a 8 está feito; o que falta depende do Carlos (0, 1, 2) ou de contas e domínio (criar o Supabase, lançar). Ver `PAINEL.md` e `LANCAMENTO.md`.

Stack: **Next.js 16 (App Router) + Supabase**, na estrutura do projeto irmão `../Lennys atelie` (acervo com filtros, coleções, preços, painel `/admin`), sem cupons.

## Como trabalhar aqui

- **Tudo em português do Brasil**: conversa, nomes de variáveis, componentes, comentários e mensagens de commit.
- **Comentários explicam o porquê**, em prosa, como nos arquivos existentes (blocos com título em caixa alta e sublinhado). Siga o estilo do arquivo que estiver editando.
- **Não invente dado do negócio.** Preço, medidas, madeira, datas, endereço, telefone: use placeholder (`[a confirmar]`) e registre no README em "Bloqueadores e pendências". Os fatos sobre o Carlos que podem ser usados estão no README.
- **Commit e push só quando o Edson pedir.** Identidade do repositório (config local): `Edson Lopes <lopesedson226@gmail.com>`. Remoto: `origin` → github.com/LopesEcom/CarlosOliveira, branch `main` (o repositório antigo, github.com/imnotlopes/carlosoliveira, ficou como o remoto `antigo`).
- **Com o Supabase ligado, a fonte da verdade das peças é o painel** (tabela `pecas`). Sem ele, o site lê `src/data/acervo.gerado.json` (de `acervo/acervo.xlsx` via `npm run acervo`), que também gera a carga inicial (`npm run seed` → `supabase/seed.sql`). Não edite os `*.gerado.json` nem o `seed.sql` à mão.
- **Mudança no banco** entra como nova migração em `supabase/migrations/` (idempotente, como a 001), nunca editando a que já rodou.
- **Não mude a ordem das colunas da planilha.** O importador lê por posição (`COLUNAS` em `scripts/criar-planilha.mjs`). Títulos podem mudar.
- Arquivos grandes ficam fora do git: `imagens Carlos/` (originais do WhatsApp) e `fotos/entrada/` (fotos cruas).

## Verificar antes de dizer que terminou

```bash
npx tsc --noEmit
```

```bash
npx oxlint
```

```bash
npm run build
```

Mudança visual: abrir no navegador (`npm run dev`, porta 3000), olhar no
celular (375 px) e no computador, e checar que não há rolagem lateral
(`document.documentElement.scrollWidth === clientWidth`).

## Design e código (o que já existe)

- **Tokens** em `src/app/globals.css` (`--tinta`, `--creme`, `--cinza`…), expostos no Tailwind como `tinta`, `creme`, `cinza`, `borda`, `branco`. Nada de hex solto nos componentes. **Fundo sempre branco**: o creme é só texto sobre os blocos escuros.
- **Escala em rem com "mostrador"** na raiz: `font-size: clamp(1rem, 1.1111vw, 1.0833rem)`. Degraus `--fs-h1…h6`, `--fs-display`, `--fs-colosso`; piso de celular em media query.
- **Tipografia em três papéis**: títulos em Source Serif 4, peso 400, caixa baixa (`texto-display`, `texto-display-sm`, `h1`…`h6`, preços); rótulos em Inter semibold caixa alta (`.rotulo`, `.rotulo-sm`, `.eyebrow`, botões `.btn-*`); corpo em Inter regular. Fontes via `next/font` em `src/app/layout.tsx`. Serifa em caixa alta só no nome colossal da capa e na `Assinatura`. Não use `font-display` junto com `.rotulo`: o utilitário vence e o rótulo sai na serifa.
- **Classes editoriais**: `.u-grid` (12 colunas, some no celular), `.col-N`, `.deslocar-N`, `.secao-p/m/g`, `.t-italico(-g)`, `.texto-display(-sm)`, `.texto-colosso` (fator 0,56 medido para a Source Serif 4), `.veu-capa`, `.rebaixado`.
- **Movimento** em `src/lib/movimento.ts`: `<Revelar>`, `useDeslizeHorizontal`, `useTelaLarga`, `useMovimentoReduzido`. Tudo respeita `prefers-reduced-motion`.
- **Dados**: tipo único `Peca`/`Colecao` em `src/lib/tipos.ts`. Leituras públicas em `src/lib/dados/consultas.ts` (`getPecas`, `getPecaPorSlug`, `getColecoes`, `getConfiguracoes`), com cache por etiqueta (`pecas`, `colecoes`, `configuracoes`) que o painel limpa com `updateTag` (`src/lib/admin/revalidar.ts`). Sem Supabase caem em `lib/dados/local.ts`. Filtros, facetas e ordem do acervo são funções puras em `lib/dados/acervo.ts`, com o estado na URL.
- **Rotas**: `src/app/(site)/` (início, `acervo`, `peca/[slug]`, `historia`, `livro`, `escola`, `contato`), com `EstruturaSite` (cabeçalho, rodapé, seleção, e as Configurações para o navegador via `lib/contato.ts`). `src/app/not-found.tsx` também usa `EstruturaSite`. O menu mora em `src/lib/rotas.ts`, junto com `caminhoPeca` e `CAMINHO_APRENDER` (destino do "Aprender a fazer").
- **Painel**: `src/app/admin/` (páginas) e `src/app/admin/acoes/` (Server Actions); `src/proxy.ts` exige sessão em `/admin` e cada página chama `exigirSessao()`. Leituras em `src/lib/admin/consultas.ts` (com sessão, sem cache, mostram peças fora do ar). Validação da peça em `src/lib/admin/peca.ts`. Fotos sobem direto do navegador ao bucket `pecas` (`EnvioFotos`, comprimidas por `comprimir-imagem.ts`).
- **Mensagens de WhatsApp** só em `src/lib/mensagens.ts`. O número vem das Configurações (padrão em `brand.whatsapp`).
- **Eventos** (visitas, cliques) por `src/app/acoes/eventos.ts`: nunca lança, não é aguardado.
- **Logo**: originais em `marca/original/` (logo horizontal e símbolo), com fundo branco. `node scripts/marca.mjs` gera as versões transparentes em `public/marca/` (tinta e creme), o `public/icon.png` e o `apple-touch-icon.png`. O componente `Assinatura` mostra a logo; no cabeçalho as duas cores trocam por opacidade ao rolar.
- **Fotos do Carlos: no máximo duas no site** (pedido do Edson): a do topo da página História (`public/atelier/Foto-Carlos.jpeg`) e a capa do livro. A capa do início usa a foto do busto de Cristo (`public/capa/cristo.webp`, a mesma da og-image), sem o Carlos.

## Onde o projeto está

Etapas 4 a 8 feitas no código (ver README, uma seção por etapa). O que falta:

- **Carlos:** decisões da Etapa 0 (perguntas prontas em `LANCAMENTO.md`), a marca (Etapa 1), as fotos (Etapa 2).
- **Edson:** ligar o painel (`PAINEL.md`), domínio, Search Console e Perfil da Empresa (`LANCAMENTO.md`).
- `npm run conferir` diz o que ainda bloqueia a divulgação.

Quando vierem as respostas do Carlos, os lugares a mexer estão na tabela do passo 1 de `LANCAMENTO.md`.

## Armadilhas já encontradas

- **Hidratação: a primeira renderização tem de ser igual no servidor e no navegador.** Nada de ler `window`, `matchMedia` ou `localStorage` no render ou no estado inicial: use `useMovimentoReduzido()`/`useTelaLarga()` (via `useSyncExternalStore`, valor do servidor `false`) ou leia num efeito. O `npm run dev` mostra a divergência no console.
- O `.revelar` só esconde conteúdo com a classe `js` no `<html>` (posta por um script em `src/app/layout.tsx`), para o HTML do servidor ser legível sem JavaScript.
- **Componente do navegador não importa código de servidor.** `lib/dados/consultas.ts` usa `unstable_cache` e o cliente do Supabase: por isso o padrão das Configurações mora em `lib/dados/padrao.ts`, que o navegador pode importar.
- O que abre sobre a página (revisão da seleção) vai num portal no `<body>`: dentro da barra escura herdava a cor do texto.
- **Next 16**: o middleware se chama `proxy.ts` (`export function proxy`). A documentação da versão instalada está em `node_modules/next/dist/docs/`.
- **Cache das leituras**: `unstable_cache` guarda peças, coleções e configurações por uma hora, e só o painel limpa (`updateTag`). Edição direta no banco (SQL Editor, seed) não aparece no site até expirar. No `next dev` o cache mora em `.next/dev/cache/fetch-cache` **e na memória**: apague a pasta com o servidor parado. Não rode `npm run build` com o `dev` ligado: os dois escrevem em `.next`.
- A regra `only-export-components` do oxlint está desligada em `src/app/**` (as páginas precisam exportar `metadata`).
- No Git Bash desta máquina, heredoc com aspas no conteúdo quebra o comando: escreva arquivos pela ferramenta de escrita.
- **sharp 0.35: `.stats()` ignora o pipeline** (recorte, filtro, redimensionamento). Materialize antes: `sharp(await pipeline.toBuffer()).stats()` — ver `estatisticas()` em `scripts/fotos.mjs`.
- A **nitidez** das fotos é medida por região (percentil 90 de uma grade 8x8), não na foto inteira; senão foto com fundo liso vira "tremida". Limite calibrado: 110.
- **HEIC do iPhone não é lido** pelo sharp; o script avisa e o guia manda o Carlos ativar "Mais compatível".
- O **número da peça** na planilha deve ser texto (`0012`); o importador também aceita `12` e completa os zeros.
- O guia de fotos é HTML renderizado pelo **Edge headless** (`msedge.exe`), com Google Fonts; precisa de internet.
- `scripts/criar-planilha.mjs` foi a migração única do acervo antigo (`acervo/obras-legado.ts`); **não rode de novo** sem `--sobrescrever` consciente, porque apaga a planilha.
- Windows + Git Bash: caminhos com espaço ("Site Carlos Silva", "imagens Carlos") sempre entre aspas.
