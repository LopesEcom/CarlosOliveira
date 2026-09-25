# Lançamento (Etapa 8)

O código está pronto para ir ao ar. O que falta está fora dele: decisões do
Carlos, contas e o domínio. Este é o roteiro, na ordem.

Para ver o que ainda é provisório:

```bash
npm run conferir
```

`✗` bloqueia a divulgação, `!` pode ser resolvido com o site no ar.

---

## 1. As decisões do Carlos (Etapa 0)

Sem estas respostas o site não deve ser divulgado. Texto pronto para mandar
no WhatsApp dele:

> Carlos, para o site ir ao ar eu preciso de algumas respostas suas:
>
> 1. Qual número de WhatsApp vai no site? É nele que chegam os pedidos.
> 2. O site mostra o preço das peças, mostra "a partir de", ou fica tudo
>    "sob consulta"?
> 3. Como o senhor entrega? Correios, transportadora, só retirada na
>    oficina, entrega pessoal em alguma cidade?
> 4. Como o cliente paga? Pix, cartão, sinal para encomenda?
> 5. Tem Instagram? Qual o @?
> 6. Em que cidade fica a oficina? Pode receber visita?
> 7. Qual nome o senhor quer no endereço do site? (ex.: carlosoliveira.art.br)
> 8. A frase "sem molde, sem resina, sem emenda" vale para todas as peças?
> 9. Qual dos três desenhos de marca o senhor escolheu (A, B ou C)? Se for o
>    C, preciso de uma foto da sua assinatura num papel branco.

Onde cada resposta entra:

| resposta | onde |
| --- | --- |
| WhatsApp, Instagram, cidade | **Configurações do painel** (`brand.ts` é só o padrão, sem Supabase) |
| preço | campo Preço de cada peça, no painel |
| entrega e pagamento | passo "Combine" em `src/app/(site)/contato/page.tsx`, FAQ em `src/data/faq.ts`, `vendas/respostas-prontas.md` |
| domínio | passo 2 abaixo |
| a frase da capa | `src/components/Capa.tsx`, a descrição padrão em `src/app/layout.tsx` e a resposta "Como cada peça é feita?" em `src/data/faq.ts` |
| marca | tokens em `src/app/globals.css`, fontes em `src/app/layout.tsx`, componente `Assinatura` |

## 2. Domínio e Vercel

1. Registrar o domínio (para `.br`: registro.br, no CPF ou CNPJ do Carlos,
   que é quem deve ser o dono).
2. Criar o projeto na Vercel ligado ao repositório `LopesEcom/CarlosOliveira`
   (Framework: Next.js; os comandos do `package.json` já servem).
3. **Settings → Domains**: adicionar o domínio e o `www`, e apontar o DNS
   como a Vercel indicar.
4. Trocar `SITE_URL` em `src/lib/brand.ts` pelo domínio (sem barra no fim)
   e publicar. É o único lugar: canônicas, sitemap, cartões e mensagens saem
   dele.
5. Ligar o painel do Carlos: `PAINEL.md` (Supabase e as duas variáveis na Vercel).

## 3. Conferir no ar

- `npm run conferir` sem nenhum `✗`.
- Abrir `https://<domínio>/peca/0002-coruja` direto (não pela página
  inicial). Tem de abrir a coruja.
- **Colar esse link numa conversa de WhatsApp**: o cartão tem de mostrar a
  foto e o nome da coruja, e não os do início. As fotos antigas são WebP; se
  o cartão sair sem foto, é o WhatsApp recusando o formato, e a solução é
  reenviar a capa da peça pelo painel (o celular gera JPEG ou WebP).
- Com o painel ligado: marcar uma peça como Vendida no `/admin` e ver a
  mudança no site na hora.
- Tocar em "Enviar" com duas peças escolhidas e mandar a mensagem para você
  mesmo: os links dela têm de abrir as peças.
- Fazer uma pré-inscrição na escola de teste.
- O WhatsApp guarda o cartão de um link por um tempo. Para testar de novo
  depois de mudar a foto, use o endereço com `?v=2` no fim.

## 4. Google Search Console

1. search.google.com/search-console → **Adicionar propriedade** →
   **Domínio** (verifica pelo DNS, e cobre `www` e sem `www`). Se preferir o
   método "Tag HTML", cole só o código em `VERIFICACAO_GOOGLE`
   (`src/lib/brand.ts`) e publique.
2. **Sitemaps** → enviar `sitemap.xml`.
3. Em uma ou duas semanas, conferir em **Páginas** se as páginas das peças
   foram indexadas.

## 5. Perfil da Empresa no Google (Google Meu Negócio)

Depende da resposta 6 (cidade, visita):

- Se a oficina recebe visita: perfil com endereço. Aí vale trocar o JSON-LD
  do Carlos de `Person` para `LocalBusiness` com `address` (ver o comentário
  em `scripts/seo.ts`).
- Se não recebe: perfil de **área de atendimento**, sem endereço público.

Em business.google.com, com a conta Google do Carlos (o perfil é dele):
nome "Carlos Oliveira, escultor entalhador", a categoria mais próxima do
ofício, o link do site, o WhatsApp e as fotos das peças. O Google pede uma
verificação, que o Carlos precisa fazer.

**Não** colocar nota nem avaliação no site antes de existirem avaliações
reais no perfil.

## 6. Depois do lançamento

- Link do site na bio do Instagram e no status do WhatsApp Business.
- Respostas rápidas do WhatsApp: `vendas/respostas-prontas.md`.
- As fotos ficam guardadas no navegador de quem visita por até uma semana
  (`vercel.json`). Foto trocada com o **mesmo nome de arquivo** pode demorar
  a aparecer para quem já viu a antiga. O `npm run fotos` gera nomes por
  peça, então isso só acontece ao refotografar a mesma peça.
