create table todos (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- keep updated_at fresh on every update
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger todos_set_updated_at
before update on todos
for each row
execute function set_updated_at();

-- Row Level Security: required by Supabase before the anon/public API
-- can read or write this table. Since this app has no auth yet, this
-- policy allows anyone with your anon key to do anything to the table.
-- Tighten this (e.g. scope to auth.uid()) once you add user accounts.
alter table todos enable row level security;

create policy "Allow all access to todos"
on todos
for all
using (true)
with check (true);
