-- Migration 001: Initial schema

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  address text,
  status text not null default 'lead' check (status in ('lead', 'active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  date timestamptz not null,
  duration_min integer not null default 60,
  type text not null check (type in ('quote', 'installation', 'maintenance', 'follow-up')),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  project_id uuid,
  created_at timestamptz not null default now()
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  appointment_id uuid references appointments(id),
  due_date timestamptz not null,
  type text not null check (type in ('follow-up-call', 'seasonal-maintenance', 'quote-expiry', 'custom')),
  note text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  title text not null,
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'completed')),
  dimensions_h numeric,
  dimensions_w numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table project_plants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  common_name text not null,
  scientific_name text not null,
  why_it_fits text,
  care_difficulty text check (care_difficulty in ('easy', 'moderate', 'demanding')),
  pairing_note text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

-- Auto-update updated_at on clients
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();
