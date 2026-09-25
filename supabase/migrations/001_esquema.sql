-- ============================================================================
-- Carlos Oliveira, escultor entalhador: o banco do site e do painel.
--
-- Rode este arquivo inteiro no SQL Editor do Supabase, de uma vez. É
-- idempotente: pode rodar de novo sem quebrar. Depois dele, rode o
-- supabase/seed.sql (as peças que já estavam na planilha).
--
-- Mesma estrutura do projeto da Lennys (peças, coleções, etiquetas,
-- configurações, eventos), sem os cupons, e com o que é do Carlos: número da
-- peça, tema, ficha técnica e situação.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

create table if not exists public.colecoes (
  id          uuid primary key default gen_random_uuid(),
  -- Endereço da coleção (`parede`). Nasce do nome e não muda: as peças
  -- guardam a coleção por ele.
  slug        text not null unique,
  nome        text not null,
  descricao   text,
  imagem_capa text,
  ordem       int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.pecas (
  id               uuid primary key default gen_random_uuid(),
  -- Quatro dígitos, o mesmo da ficha de papel e da etiqueta da peça.
  numero           text not null unique check (numero ~ '^[0-9]{4}$'),
  -- O endereço da página: `0002-coruja`. Sai do número e do nome.
  slug             text not null unique,
  nome             text not null,
  tema             text not null check (tema in ('sacra', 'fauna', 'figura', 'natureza', 'utilitaria')),
  descricao        text,
  historia         text,
  madeira          text,
  altura           numeric(7, 1),
  largura          numeric(7, 1),
  profundidade     numeric(7, 1),
  peso             numeric(7, 2),
  ano              int,
  acabamento       text,
  -- Nulo é "sob consulta".
  preco            numeric(10, 2),
  -- Valor cheio, mostrado riscado. Só em promoção.
  preco_original   numeric(10, 2),
  a_partir_de      boolean not null default false,
  situacao         text not null default 'a-venda'
                   check (situacao in ('a-venda', 'reservada', 'vendida', 'fora-de-venda')),
  aceita_encomenda boolean not null default true,
  destaque         boolean not null default false,
  ativo            boolean not null default true,
  -- O selo no canto da foto. Texto solto: apagar uma sugestão do catálogo
  -- de etiquetas não tira o selo de quem já usa.
  etiqueta         text check (etiqueta is null or char_length(etiqueta) <= 18),
  -- Slugs das coleções.
  colecoes         text[] not null default '{}',
  -- Caminhos no bucket `pecas`, ou em public/ (começam com "/") para as
  -- fotos antigas, do WhatsApp. A primeira é a capa.
  imagens          text[] not null default '{}',
  ordem            int not null default 0,
  created_at       timestamptz not null default now(),
  constraint pecas_preco_original_maior
    check (preco_original is null or preco is null or preco_original > preco)
);

create table if not exists public.etiquetas (
  id         uuid primary key default gen_random_uuid(),
  texto      text not null unique check (char_length(trim(texto)) between 1 and 18),
  ordem      int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.configuracoes (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb
);

create table if not exists public.eventos (
  id         uuid primary key default gen_random_uuid(),
  tipo       text not null check (tipo in ('visita_peca', 'clique_whatsapp', 'clique_aprender')),
  peca_id    uuid references public.pecas (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------------------

create index if not exists pecas_ativo_idx      on public.pecas (ativo);
create index if not exists pecas_colecoes_idx   on public.pecas using gin (colecoes);
create index if not exists eventos_criado_idx   on public.eventos (created_at desc);
create index if not exists eventos_peca_idx     on public.eventos (peca_id);

-- ----------------------------------------------------------------------------
-- Quem pode o quê (Row Level Security)
--
-- O público (anon) só LÊ o que está publicado. Qualquer escrita exige estar
-- logado no painel. A exceção é `eventos`, que aceita insert público porque
-- é o que conta as visitas de quem não tem conta, e só o painel lê.
-- ----------------------------------------------------------------------------

alter table public.colecoes      enable row level security;
alter table public.pecas         enable row level security;
alter table public.etiquetas     enable row level security;
alter table public.configuracoes enable row level security;
alter table public.eventos       enable row level security;

drop policy if exists "colecoes: leitura publica" on public.colecoes;
create policy "colecoes: leitura publica" on public.colecoes for select to anon, authenticated using (true);
drop policy if exists "colecoes: escrita do painel" on public.colecoes;
create policy "colecoes: escrita do painel" on public.colecoes for all to authenticated using (true) with check (true);

drop policy if exists "pecas: leitura publica das ativas" on public.pecas;
create policy "pecas: leitura publica das ativas" on public.pecas for select to anon using (ativo = true);
drop policy if exists "pecas: leitura total do painel" on public.pecas;
create policy "pecas: leitura total do painel" on public.pecas for select to authenticated using (true);
drop policy if exists "pecas: escrita do painel" on public.pecas;
create policy "pecas: escrita do painel" on public.pecas for all to authenticated using (true) with check (true);

drop policy if exists "etiquetas: so o painel" on public.etiquetas;
create policy "etiquetas: so o painel" on public.etiquetas for all to authenticated using (true) with check (true);

drop policy if exists "configuracoes: leitura publica" on public.configuracoes;
create policy "configuracoes: leitura publica" on public.configuracoes for select to anon, authenticated using (true);
drop policy if exists "configuracoes: escrita do painel" on public.configuracoes;
create policy "configuracoes: escrita do painel" on public.configuracoes for all to authenticated using (true) with check (true);

drop policy if exists "eventos: insert publico" on public.eventos;
create policy "eventos: insert publico" on public.eventos for insert to anon, authenticated with check (true);
drop policy if exists "eventos: leitura do painel" on public.eventos;
create policy "eventos: leitura do painel" on public.eventos for select to authenticated using (true);

-- ----------------------------------------------------------------------------
-- As fotos: bucket `pecas`, público para leitura (as fotos aparecem no site
-- sem login), envio e troca só para quem está logado no painel.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('pecas', 'pecas', true)
on conflict (id) do update set public = true;

drop policy if exists "pecas bucket: leitura publica" on storage.objects;
create policy "pecas bucket: leitura publica" on storage.objects for select to anon, authenticated using (bucket_id = 'pecas');
drop policy if exists "pecas bucket: envio do painel" on storage.objects;
create policy "pecas bucket: envio do painel" on storage.objects for insert to authenticated with check (bucket_id = 'pecas');
drop policy if exists "pecas bucket: troca do painel" on storage.objects;
create policy "pecas bucket: troca do painel" on storage.objects for update to authenticated using (bucket_id = 'pecas') with check (bucket_id = 'pecas');
drop policy if exists "pecas bucket: exclusao do painel" on storage.objects;
create policy "pecas bucket: exclusao do painel" on storage.objects for delete to authenticated using (bucket_id = 'pecas');

-- ----------------------------------------------------------------------------
-- Para o Carlos não começar com a lista de etiquetas vazia.
-- ----------------------------------------------------------------------------

insert into public.etiquetas (texto, ordem) values
  ('Novidade', 1),
  ('Última peça', 2),
  ('Peça premiada', 3),
  ('Sob encomenda', 4)
on conflict (texto) do nothing;
