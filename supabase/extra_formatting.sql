alter table roles enable row level security;
alter table role_codes enable row level security;


-- Users can read their own role
create policy "Users can read their own role"
on roles for select
using (auth.uid() = user_id);

-- Admins can read all roles
create policy "Admins can read all roles"
on roles for select
using (
  exists (
    select 1 from roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  )
);

-- Admins can modify roles
create policy "Admins can modify roles"
on roles for all
using (
  exists (
    select 1 from roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  )
);


-- Anyone can read role codes during signup
create policy "Anyone can read role codes"
on role_codes for select
using (true);

-- Only admins can insert/update/delete role codes
create policy "Admins manage role codes"
on role_codes for all
using (
  exists (
    select 1 from roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  )
);


insert into role_codes (code, role) values
  ('ADMIN-2025', 'admin'),
  ('PARENT-2025', 'parent'),
  ('KID-2025', 'kid')
on conflict (code) do nothing;
