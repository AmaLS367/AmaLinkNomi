create table if not exists public.user_nomi_credentials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nomi_api_key_encrypted text not null,
  nomi_api_key_iv text not null,
  nomi_api_key_last4 text not null check (char_length(nomi_api_key_last4) = 4),
  validated_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_nomi_credentials enable row level security;

create policy "service role manages nomi credentials"
on public.user_nomi_credentials
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
