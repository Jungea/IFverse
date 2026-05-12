create extension if not exists "uuid-ossp";

create table projects (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users not null,
  title       text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table routes (
  id          uuid default uuid_generate_v4() primary key,
  project_id  uuid references projects on delete cascade not null,
  name        text not null,
  color       text not null default '#4f46e5',
  created_at  timestamptz default now()
);

create table nodes (
  id          uuid default uuid_generate_v4() primary key,
  project_id  uuid references projects on delete cascade not null,
  route_id    uuid references routes on delete set null,
  type        text not null default 'scene' check (type in ('scene', 'branch', 'ending')),
  title       text not null default 'New Scene',
  content     jsonb default '{}',
  color       text,
  position_x  float not null default 0,
  position_y  float not null default 0,
  created_at  timestamptz default now()
);

create table edges (
  id              uuid default uuid_generate_v4() primary key,
  project_id      uuid references projects on delete cascade not null,
  source_node_id  uuid references nodes on delete cascade not null,
  target_node_id  uuid references nodes on delete cascade not null,
  label           text,
  created_at      timestamptz default now()
);

alter table projects enable row level security;
alter table routes  enable row level security;
alter table nodes   enable row level security;
alter table edges   enable row level security;

create policy "own projects" on projects for all using (auth.uid() = user_id);
create policy "own routes"   on routes   for all using (project_id in (select id from projects where user_id = auth.uid()));
create policy "own nodes"    on nodes    for all using (project_id in (select id from projects where user_id = auth.uid()));
create policy "own edges"    on edges    for all using (project_id in (select id from projects where user_id = auth.uid()));
