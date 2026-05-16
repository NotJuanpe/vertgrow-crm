-- Migration 002: Project phases (Cronograma tab) + Content drafts (Content Agent)

create table project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  notes text,
  created_at timestamptz not null default now()
);

create index project_phases_project_id_idx on project_phases(project_id);

create table content_drafts (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  caption text not null,
  hashtags text not null,
  image_brief text not null,
  created_at timestamptz not null default now()
);
