-- Table was created via the Supabase Table Editor as "Ideas" (capital I),
-- but the app queries the lowercase "ideas". Rename it to match, then add
-- the RLS policy that lets the anon key read/write it.

alter table "Ideas" rename to ideas;

-- Row Level Security: required by Supabase before the anon/public API
-- can read or write this table. Since this app has no auth yet, this
-- policy allows anyone with your anon key to do anything to the table.
-- Tighten this (e.g. scope to auth.uid()) once you add user accounts.
create policy "Allow all access to ideas"
on ideas
for all
using (true)
with check (true);
