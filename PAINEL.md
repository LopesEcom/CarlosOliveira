# O painel do Carlos

Duas partes: **ligar o painel** (uma vez, pelo Edson) e **o manual do Carlos**
(para mandar para ele).

---

## Parte 1 · Ligar o painel (Edson, uma vez)

Enquanto isto não for feito, o site funciona com as peças da planilha e o
`/admin` mostra "O painel ainda não está ligado".

### 1. Criar o projeto no Supabase

1. supabase.com → **New project**, na conta que vai ser do site (de
   preferência um e-mail do Carlos, com a senha guardada por você). Região:
   São Paulo.
2. **SQL Editor** → cole `supabase/migrations/001_esquema.sql` inteiro →
   **Run**. Cria as tabelas, as regras de acesso e o bucket `pecas` das fotos.
3. No terminal do projeto, gere a carga das peças da planilha:

   ```bash
   npm run seed
   ```

   Depois cole `supabase/seed.sql` no SQL Editor → **Run**. Entram as 3
   coleções e as 32 peças. Pode rodar de novo sem medo: o que já existe é
   pulado, nada é sobrescrito.

   **Mudança feita direto no banco demora até uma hora para aparecer.** O
   site guarda as peças em cache e só limpa quando alguém salva pelo painel.
   Carga ou edição pelo SQL Editor não avisa o site: na Vercel, faça um
   novo deploy (ou salve qualquer coisa no painel); no computador, pare o
   `npm run dev`, apague `.next/dev/cache/fetch-cache` e suba de novo.

### 2. Criar o acesso do Carlos

**Authentication → Users → Add user → Create new user**: e-mail e senha do
Carlos, com "Auto Confirm User" marcado. Não existe cadastro pelo site: só
entra quem for criado aqui.

Em **Authentication → Sign In / Providers**, desligue "Allow new users to sign
up", para ninguém criar conta sozinho.

### 3. Pôr as chaves no site

Em **Project Settings → API**, copie a *Project URL* e a chave *anon public*.

- **Na sua máquina:** copie `.env.example` para `.env.local` e preencha.
- **Na Vercel:** Settings → Environment Variables → as mesmas duas
  (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`), para
  Production e Preview. Depois, um novo deploy.

A chave *anon* pode ficar no site: quem protege os dados são as regras do
SQL (o público só lê o que está publicado; escrever exige login). A chave
*service_role* **nunca** vai para o site.

### 4. Conferir

1. Abra `/admin`, entre com o acesso do Carlos.
2. **Configurações**: preencha o WhatsApp real e salve. Clique em "Testar no
   WhatsApp".
3. **Peças**: mude a situação de uma peça e confira no site. Volte.
4. **Nova peça**: cadastre uma de teste com uma foto do celular, veja no
   site, e exclua.

A partir daqui, **a fonte da verdade é o painel**. A planilha não é mais lida
pelo site.

---

## Parte 2 · Manual do Carlos

Texto para mandar a ele (ou imprimir). Não precisa saber nada de
computador além de usar o celular.

### Entrar

Abra **seusite.com.br/admin** e digite o e-mail e a senha. O painel tem cinco
partes, na barra de baixo: **Resultados, Peças, Coleções, Etiquetas e
Ajustes**.

### Vendeu uma peça

**Peças** → ache a peça (dá para buscar pelo número) → na caixinha de
situação, escolha **Vendida**. Pronto: no site ela continua aparecendo, como
prova do seu trabalho, mas sem o botão de comprar, e quem abrir pode pedir
"uma parecida, sob encomenda".

Se alguém pediu para separar, escolha **Reservada**.

### Cadastrar uma peça nova

**Peças → Nova peça.**

- O **número** já vem preenchido com o próximo livre. Escreva o mesmo número
  na ficha de papel e na etiqueta da peça.
- Só o **nome** é obrigatório. O resto pode completar depois.
- **Ficha técnica**: madeira, medidas em centímetros (só o número, como 32 ou
  32,5), peso, ano, acabamento. O que ficar em branco aparece no site como
  "sob consulta".
- **Preço**: deixe em branco para o site dizer "Valor sob consulta". Se a
  peça estiver em promoção, ponha o preço antigo no segundo campo: ele
  aparece riscado.
- **Fotos**: toque em **Tirar ou escolher fotos**. Pode tirar na hora ou
  escolher da galeria, várias de uma vez. **A primeira é a capa**: é a que
  aparece no acervo e quando alguém manda o link. Use as setinhas para mudar
  a ordem.
- **Coleções**: toque nas que valem para a peça (pode ser mais de uma).
- Toque em **Cadastrar peça** (a barra fica presa embaixo da tela).

Peça sem foto fica guardada no painel, mas não aparece no site.

### Tirar uma peça do site sem apagar

Na lista de **Peças**, desligue a chave **No site**. Ela some do site e fica
guardada aqui, com fotos e preço, pronta para voltar.

**Só exclua** quando a peça saiu do acervo para sempre: excluir apaga as
fotos também, e não dá para desfazer.

### Destaque

A chave **Destaque** põe a peça na página inicial. Umas seis a oito peças
funcionam bem. Destaque em tudo é destaque em nada.

### Selo

O **selo** é a palavrinha no canto da foto ("Novidade", "Última peça"). Escreva
direto na lista de peças; some quando você apaga o texto. As sugestões ficam
em **Etiquetas**.

### Coleções

As coleções são o "lugar da casa" (Devoção, Para a parede, Para a mesa e a
estante). Em **Coleções** você muda o nome, a foto da capa e a ordem. Para
criar uma nova, use o quadro de baixo e depois escolha as peças dela no
cadastro de cada peça. Coleção com peças não pode ser apagada.

### Ajustes

O **WhatsApp** é o mais importante: é para ele que vai toda conversa do site.
Só números, com 55 e o DDD. Abaixo, a **mensagem** que chega quando alguém quer
uma peça, com uma prévia de como ela chega.

### Resultados

Dos últimos 30 dias: quantas pessoas abriram peças, quantas foram conversar no
WhatsApp, e quais peças são mais vistas. Peça muito vista e pouco pedida
costuma pedir foto melhor, preço ou descrição.

### Se aparecer um aviso

| Aviso | O que fazer |
| --- | --- |
| "Já existe uma peça com esse número" | Confira a ficha de papel e use outro número |
| "O preço antigo precisa ser maior que o preço atual" | O riscado tem de ser o maior, senão não é promoção |
| "Esta coleção tem 3 peças" | Tire as peças dela antes de apagar |
| "Não foi possível salvar. Tente de novo em instantes" | Geralmente é a internet. Espere e tente de novo |

Se um aviso não fizer sentido, tire um print e mande para o Edson.
