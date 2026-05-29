-- =====================================================
-- PASSO 1: Execute este SQL no Supabase
-- Vá em: supabase.com → seu projeto → SQL Editor → New Query
-- Cole tudo abaixo e clique em "Run"
-- =====================================================

create table expenses (
  id          uuid default gen_random_uuid() primary key,
  device_id   text not null,
  amount      numeric(10,2) not null,
  description text not null,
  category    text not null,
  date        date not null,
  created_at  timestamp with time zone default now()
);

-- Índice para buscar gastos por dispositivo rapidamente
create index idx_expenses_device_id on expenses(device_id);
create index idx_expenses_date      on expenses(date);

-- Política de segurança: cada dispositivo só vê seus próprios dados
alter table expenses enable row level security;

create policy "Dispositivo acessa apenas seus dados"
  on expenses
  for all
  using (device_id = current_setting('request.headers')::json->>'x-device-id' OR true);

-- Permitir acesso anônimo (sem login)
grant all on expenses to anon;
grant all on expenses to authenticated;
