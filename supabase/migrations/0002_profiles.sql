-- Perfis públicos.
--
-- `auth.users` não pode ser lido pelo cliente, então o nome e o avatar que
-- aparecem nas opiniões e na lista de "eu vou" precisam de uma tabela própria.
-- Uma linha é criada por gatilho a cada cadastro.

create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default 'Anônimo',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "perfis são públicos" on profiles
  for select using (true);

create policy "cada um edita o próprio perfil" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      'Anônimo'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Cria o perfil de quem já se cadastrou antes desta migration.
insert into profiles (id, name)
select id, coalesce(raw_user_meta_data ->> 'name', split_part(email, '@', 1), 'Anônimo')
from auth.users
on conflict (id) do nothing;

-- Ligações para o PostgREST conseguir aninhar o perfil nas consultas.
--
-- `event_attendances.user_id` e `event_evaluations.user_id` apontam para
-- `auth.users`, que o cliente não enxerga. Sem uma chave estrangeira para
-- `profiles`, um select como `profiles ( name, avatar_url )` não resolve o
-- relacionamento e a consulta falha. As duas chaves convivem: `profiles.id`
-- já é `auth.users.id`.

alter table event_attendances
  add constraint event_attendances_profile_fkey
  foreign key (user_id) references profiles (id) on delete cascade;

alter table event_evaluations
  add constraint event_evaluations_profile_fkey
  foreign key (user_id) references profiles (id) on delete cascade;
