create index if not exists idx_roles_user_id on roles(user_id);
create index if not exists idx_roles_role on roles(role);
create index if not exists idx_role_codes_role on role_codes(role);
