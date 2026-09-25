# Carlos Oliveira · site do mestre entalhador

Site de marca de **Carlos Oliveira**, escultor entalhador de 72 anos, com
mais de 300 peças prontas em madeira maciça. Ele quer, nas palavras dele, "quase
um mini e-commerce de marca que leva ao WhatsApp": um site refinado que sirva
para **vender** (peças prontas e encomendas) e, no futuro, para **receber
candidatos da escola de entalhadores** que ele vai abrir. Não é site simples.

Não há carrinho nem checkout: a pessoa escolhe as peças e o site monta uma
mensagem de WhatsApp com elas.

- **Repositório:** https://github.com/LopesEcom/CarlosOliveira
- **Quem desenvolve:** Edson Lopes (lopesedson226@gmail.com)
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 3 + Supabase (banco, login e fotos do painel). Hospedagem prevista: Vercel.
- **Estrutura de loja:** a do projeto irmão `../Lennys atelie` (acervo com filtros, coleções, preços, painel), sem os cupons.

---

## Quem é o Carlos (fatos confirmados)

Fonte: o próprio Carlos e a introdução do livro dele (foto em
`imagens Carlos/livro-introducao.jpg`). **Não invente além disto.**

- 72 anos. Caçula, nasceu na **Pavuna** e cresceu em **Além Paraíba**. O pai era **tupieiro**.
- Aprendeu o ofício em **Petrópolis**.
- Consagrado **Mestre Entalhador no Bixiga** (Bela Vista, São Paulo) **aos 21 anos**; trabalhou **20 anos em São Paulo**.
- Feiras em **Niterói** (a bordo de um velho Gordini) e a **reforma de um castelo no Rio de Janeiro**.
- Teve **loja em Cabo Frio**. Uma **bailarina de madeira** dele foi premiada pelo **Sebrae** como a melhor da Região dos Lagos.
- Companheira: **Marina**. O entalhe foi, nas palavras dele, a sua cura ("esculpiu a minha própria cura").
- Livro: **"Arterapia: Minha história, minha arte, minha missão"** (título da capa que o Carlos fez, `public/livro/capa.jpeg`; antes o site dizia "Artepira, por que foi uma terapia para mim"), autobiografia com um **manual de entalhes** no fim. A introdução se chama "O Silêncio da Madeira e o Grito da Vida".
- Usa a palavra **formão** (não "goiva") para a ferramenta. Escreve **Bixiga** com i.

---

## Onde o projeto está

| Etapa | O que é | Situação |
| --- | --- | --- |
| 0 | Decisões e dados do negócio | **Pendente.** Perguntas prontas em `LANCAMENTO.md` |
| 1 | Identidade da marca | **Rodada 1 entregue**, aguardando o Carlos escolher |
| 2 | Fotografia do acervo | **Pronta do nosso lado.** Aguardando o Carlos fotografar o piloto |
| 3 | Modelo de dados das peças | **Concluída** (planilha → carga inicial do banco) |
| 4 | Site v2: páginas de verdade, endereço por peça | **Feita**, falta aplicar a marca (depende da Etapa 1) |
| 5 | Venda fechando no WhatsApp | **Feita** (respostas do Carlos dependem da Etapa 0) |
| 6 | Painel para o Carlos publicar sozinho | **Feito no código** (`/admin`). Falta criar o Supabase: `PAINEL.md` |
| 7 | Escola de entalhadores | **Pré-inscrição feita.** Turmas, local e valor dependem do Carlos |
| 8 | Lançamento | **Pronto do nosso lado.** Roteiro em `LANCAMENTO.md` |

### O site

| endereço | página |
| --- | --- |
| `/` | início: capa, oficina, deslize das peças em destaque, vitrine, capas das coleções, bancada, livro, escola, encomenda, dúvidas |
| `/acervo` | o acervo na estrutura da Lennys: capas das coleções, filtros na coluna (gaveta no celular) por **coleção, tema, madeira e preço**, "só à venda", busca, ordem e "Carregar mais". Tudo **na URL** (`?colecao=parede&tema=sacra&preco=500-2000&ordem=menor-preco`). Uma coleção sozinha ganha a capa dela no topo |
| `/peca/0002-coruja` | a peça: galeria com zoom, selo, preço (com o antigo riscado, em promoção), ficha técnica e as **duas formas de ficar com ela**: **comprar** (WhatsApp com número e link da peça; vendida vira "uma parecida, sob encomenda") ou **aprender a fazer** (leva ao livro; ver abaixo) |
| `/historia`, `/livro`, `/escola`, `/contato` | a trajetória, o livro, a pré-inscrição da escola, o contato |
| `/admin` | o painel do Carlos (ver Etapa 6) |

- **Aprender a fazer:** o botão da página de cada peça leva a `CAMINHO_APRENDER` em `src/lib/rotas.ts`. Hoje é `/livro`; quando a landing do livro existir, é trocar essa constante.
- **Seleção:** o "+" dos cartões junta várias peças numa mensagem só (barra embaixo, com revisão antes de enviar). Guardada no navegador.
- **Link antigo não quebra:** `/peca/0003` ou `/peca/3-nome-antigo` redirecionam para o endereço atual da peça 0003.
- **Fundo sempre branco.** O creme só aparece como cor de texto sobre os blocos escuros de nogueira (capa, livro, rodapé).
- **Cartão do link no WhatsApp:** cada página sai do servidor com título, descrição e foto dela (metadados do Next), então o link de uma peça chega com a foto da peça.

### Etapa 6 · O painel (`/admin`)

A mesma ideia do painel da Lennys, sem cupons, links e mídias:

- **Resultados:** peças no site, visitas, conversas no WhatsApp, cliques em "aprender a fazer", gráfico por dia e as peças mais vistas (últimos 30 dias).
- **Peças:** lista com busca; **situação, selo, "No site" e "Destaque" mudam direto na lista** (marcar "Vendida" depois de uma venda é um toque). Cadastro e edição com número, nome, tema, descrição, história, ficha técnica, preço, preço antigo (promoção), "a partir de", coleções, selo e **fotos enviadas do celular** (comprimidas no aparelho, a primeira é a capa).
- **Coleções:** criar, renomear, capa, ordem, apagar (só vazia).
- **Etiquetas:** as sugestões de selo.
- **Configurações:** WhatsApp, Instagram, cidade, e-mail e a mensagem de compra, com prévia. Valem no site na hora.

**Sem Supabase configurado, o site funciona igual**, com as peças da planilha (`src/data/acervo.gerado.json`), e o `/admin` explica o que falta. Para ligar: **`PAINEL.md`** (criar o projeto, rodar o SQL, carregar as 31 peças, criar o acesso do Carlos, pôr as chaves na Vercel). O guia de uso para o Carlos também está lá.

### Etapa 1 · Marca (rodada 1)

O Carlos não tem logo. Três caminhos foram apresentados num quadro:
**https://claude.ai/artifact/77z7vyPGUfLAKeP91qVhAu** (privado; compartilhar pelo menu Share).

- **A · Marca de fogo:** selo "CO" num quadrado chanfrado com anéis de crescimento dentro do O, para queimar com ferro na base das peças.
- **B · O corte:** bloco escuro com uma lasca de formão em forma de folha de oliveira (o sobrenome).
- **C · A assinatura:** assinatura do Carlos com traço de formão + monograma CO. **Precisa da assinatura real dele.**

Fontes dos símbolos em `marca/rodada-1/`. O site usa a identidade provisória: nogueira e branco, **Source Serif 4** nos títulos (peso 400, caixa baixa) e **Inter** no texto e nos rótulos. Quando a marca vier, a troca é nos tokens de `src/app/globals.css`, nas fontes de `src/app/layout.tsx` e no componente `Assinatura`.

### Etapa 2 · Fotografia

- **Guia para o Carlos** em cartões: `fotos/guia/saida/01-capa.png` … `07-piloto.png`. **Ficha da peça** para imprimir: `fotos/guia/saida/ficha-da-peca.pdf`.
- Com o painel ligado, **o Carlos envia as fotos direto pelo cadastro da peça**. O `npm run fotos` (enquadramento automático e controle de qualidade) continua disponível para lotes grandes feitos pelo Edson.

### Etapas 5, 7 e 8

- **Venda:** revisão da seleção antes do WhatsApp (nome, cidade e observação opcionais) e `vendas/respostas-prontas.md` para o WhatsApp Business do Carlos.
- **Escola:** `/escola` tem pré-inscrição (nome, cidade, experiência, horário) que vira mensagem de WhatsApp. Nada é guardado no site.
- **Lançamento:** domínio em `SITE_URL` (`src/lib/brand.ts`), verificação do Search Console em `VERIFICACAO_GOOGLE`, `npm run conferir` e o roteiro em `LANCAMENTO.md`.

---

## De onde vêm as peças

**Com o painel ligado, a fonte da verdade é o painel** (tabela `pecas` do Supabase). A planilha `acervo/acervo.xlsx` serviu de carga inicial:

```
acervo/acervo.xlsx  → npm run acervo → src/data/acervo.gerado.json → npm run seed → supabase/seed.sql
```

- O **número** (4 dígitos) é a chave de tudo: ficha de papel, etiqueta, mensagem de WhatsApp, endereço da página. Peças 0001–0032 já existem (0001 é a bailarina, ainda sem foto). **Peça nova: 0033 em diante** (o painel sugere o próximo).
- Peça sem nenhuma foto fica guardada mas **não aparece no site**.
- Fotos antigas (WhatsApp) ficam em `public/obras/` e o banco guarda o caminho (`/obras/…`); as enviadas pelo painel vão para o bucket `pecas` do Supabase.

---

## Comandos

```bash
npm install
```

```bash
npm run dev
```

| comando | o que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (porta 3000) |
| `npm run build` | build de produção do Next |
| `npm run tipos` | `tsc --noEmit` |
| `npm run lint` | oxlint |
| `npm run acervo` | planilha → `src/data/acervo.gerado.json` + `acervo/relatorio.md` |
| `npm run seed` | JSON → `supabase/seed.sql` (carga inicial; não sobrescreve o que já existe) |
| `npm run fotos` | processa `fotos/entrada/` → `public/acervo/` + `src/data/fotos.gerado.json` |
| `npm run guia` | regenera os cartões e a ficha do guia de fotos (usa o Microsoft Edge) |
| `npm run conferir` | o que ainda impede o site de ser divulgado |

---

## Estrutura

```
src/app/(site)/        páginas públicas: início, acervo, peca/[slug], historia, livro, escola, contato
src/app/admin/         o painel: resultados, pecas, colecoes, etiquetas, configuracoes, entrar; acoes/ (gravação)
src/app/acoes/         eventos.ts (visitas e cliques para os Resultados)
src/app/layout.tsx     fontes, metadados, JSON-LD do Carlos
src/proxy.ts           protege /admin (o antigo middleware, no Next 16)
src/components/        seções, GradeObras, Preco, Visor; acervo/ (filtros), peca/ (galeria, compra, ficha), admin/
src/lib/dados/         consultas.ts (leituras com cache), acervo.ts (filtros), local.ts (planilha), linhas.ts
src/lib/admin/         consultas, validação da peça, compressão de foto, sessão
src/lib/supabase/      clientes (público, servidor, navegador) e env
src/lib/               tipos, formato, mensagens (WhatsApp), rotas, brand, selecao, movimento
supabase/              migrations/001_esquema.sql e seed.sql
acervo/  fotos/  marca/  vendas/  public/   (como antes)
```

---

## Bloqueadores e pendências

**Não pode ir ao ar sem:**

- **Número de WhatsApp real**: nas Configurações do painel (ou `brand.whatsapp`, o padrão, hoje `5500000000000`, inválido de propósito).
- **Decisões da Etapa 0:** preço, frete, retirada, pagamento, domínio, Instagram, cidade.

**Para o painel funcionar:** criar o Supabase e seguir `PAINEL.md`.

**Confirmar com o Carlos:**

- Qual caminho de marca (A, B ou C); se C, a assinatura real dele.
- A bailarina: foto, e se está à venda.
- As peças **0033 Águia sobre a esfera** e **0034 Águia sobre o bloco** entraram pelas fotos novas, sem ficha: nome, situação, medidas e madeira a confirmar (nome provisório, descritivo).
- As fotos novas de `imagens Carlos/peças/` são **tratadas por IA (Gemini)**: conferir com o Carlos se cada uma é fiel à peça (entalhe, cor, proporção) antes de divulgar. `0024 Figura de pé` e `0025 Figura com manto` parecem ser a mesma peça em dois ângulos.
- Todas as peças têm foto nova. A 0018 Ave estilizada saiu do acervo a pedido do Edson.
- A capa do livro diz **"Carlos Roberto, Mestre Escultor"**, e o site usa "Carlos Oliveira": confirmar qual nome ele assina.
- O "Aprender a fazer" das peças abre a apostila **Escola Oficina Arte Pira** num link do Meta AI (`CAMINHO_APRENDER` em `src/lib/rotas.ts`). Link de terceiro, pode sair do ar: trocar pela landing do livro quando existir.
- `public/obras/` guarda cópias das imagens de `imagens Carlos/peças/` (~73 MB) que o site não usa mais (as fotos saem de `public/acervo/`). Vão para a Vercel se ficarem ali.
- "Sem molde, sem resina, sem emenda" (texto da capa e da FAQ que nunca veio dele).
- A ordem da trajetória e os anos.
- O sumário real do manual de entalhes (a seção do livro usa tópicos genéricos).
- Foto da capa do livro (hoje a capa é tipográfica e provisória).
- Madeira, medidas e preço de cada peça: agora ele mesmo preenche no painel.
- **Escola:** local, datas, duração, vagas, valor e público (`A_DEFINIR` em `src/app/(site)/escola/page.tsx`).
- **Compra:** pagamento, frete e retirada (passo "Combine" em `src/app/(site)/contato/page.tsx`).

---

## Referências

- `../Lennys atelie`: estrutura de loja (acervo, filtros, coleções, preços, painel, Supabase).
- `../atelierdaniellinoivas`: origem das animações (capa com palavra colossal, revelação ao rolar, deslize horizontal, visor, seleção que vira mensagem).
