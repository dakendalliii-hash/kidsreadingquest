create table if not exists role_codes (
  code text primary key,
  role text not null,
  created_at timestamp with time zone default now()
);
