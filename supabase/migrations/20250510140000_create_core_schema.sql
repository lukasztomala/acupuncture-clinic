-- migration: create core schema for mimiavable product
-- purpose: define extensions, enums, tables, rls policies, triggers and indexes
-- affected tables: profiles, visits, work_schedule, time_blocks, notes
-- special considerations: enable rls on all tables, define granular policies, use uuid-ossp, gist indexes for time ranges

-- enable extension for uuid generation
create extension if not exists "uuid-ossp";

-- define enums
create type role_enum as enum ('role_patient', 'role_worker');
create type status_enum as enum ('scheduled', 'canceled', 'completed');
create type visit_type_enum as enum ('first_time', 'follow_up');

-- create profiles table
create table public.profiles (
  user_id uuid primary key default uuid_generate_v4(),
  role role_enum not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  date_of_birth date not null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security on profiles
alter table public.profiles enable row level security;

-- policy: patient can select and update own profile if not deleted
create policy patient_self_select on public.profiles for select using (
  auth.uid() = user_id and deleted_at is null
);
create policy patient_self_update on public.profiles for update using (
  auth.uid() = user_id and deleted_at is null
);

-- policy: worker can select and update any profile
create policy worker_all_select on public.profiles for select to authenticated using (
  auth.role() = 'worker'
);
create policy worker_all_update on public.profiles for update to authenticated using (
  auth.role() = 'worker'
);

-- create visits table
create table public.visits (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.profiles(user_id) on delete no action,
  start_time timestamptz not null,
  end_time timestamptz not null,
  purpose text null,
  status status_enum not null default 'scheduled',
  visit_type visit_type_enum not null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time),
  exclude using gist (tstzrange(start_time, end_time) with &&)
);

-- enable row level security on visits
alter table public.visits enable row level security;

-- policies for visits
create policy patient_visits_select on public.visits for select using (
  auth.uid() = patient_id and deleted_at is null
);
create policy patient_visits_insert on public.visits for insert with check (
  auth.uid() = patient_id
);
create policy patient_visits_update on public.visits for update using (
  auth.uid() = patient_id and deleted_at is null
);
create policy patient_visits_delete on public.visits for delete using (
  auth.uid() = patient_id and deleted_at is null
);

create policy worker_visits_select on public.visits for select to authenticated using (
  auth.role() = 'worker'
);
create policy worker_visits_insert on public.visits for insert to authenticated with check (
  auth.role() = 'worker'
);
create policy worker_visits_update on public.visits for update to authenticated using (
  auth.role() = 'worker'
);
create policy worker_visits_delete on public.visits for delete to authenticated using (
  auth.role() = 'worker'
);

-- create work_schedule table
create table public.work_schedule (
  id uuid primary key default uuid_generate_v4(),
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  check (start_time < end_time),
  unique (day_of_week, start_time, end_time)
);

-- enable rls on work_schedule
alter table public.work_schedule enable row level security;

-- policies for work_schedule (worker only)
create policy worker_schedule_select on public.work_schedule for select to authenticated using (
  auth.role() = 'worker'
);
create policy worker_schedule_insert on public.work_schedule for insert to authenticated with check (
  auth.role() = 'worker'
);
create policy worker_schedule_update on public.work_schedule for update to authenticated using (
  auth.role() = 'worker'
);
create policy worker_schedule_delete on public.work_schedule for delete to authenticated using (
  auth.role() = 'worker'
);

-- create time_blocks table
create table public.time_blocks (
  id uuid primary key default uuid_generate_v4(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_by uuid not null references public.profiles(user_id) on delete no action,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

-- enable rls on time_blocks
alter table public.time_blocks enable row level security;

-- policies for time_blocks (worker only)
create policy worker_blocks_select on public.time_blocks for select to authenticated using (
  auth.role() = 'worker'
);
create policy worker_blocks_insert on public.time_blocks for insert to authenticated with check (
  auth.role() = 'worker'
);
create policy worker_blocks_update on public.time_blocks for update to authenticated using (
  auth.role() = 'worker'
);
create policy worker_blocks_delete on public.time_blocks for delete to authenticated using (
  auth.role() = 'worker'
);

-- create notes table
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  visit_id uuid references public.visits(id) on delete no action null,
  patient_id uuid not null references public.profiles(user_id) on delete no action,
  author_id uuid not null references public.profiles(user_id) on delete no action,
  content text not null,
  created_at timestamptz not null default now()
);

-- enable rls on notes
alter table public.notes enable row level security;

-- policies for notes (worker only)
create policy worker_notes_select on public.notes for select to authenticated using (
  auth.role() = 'worker'
);
create policy worker_notes_insert on public.notes for insert to authenticated with check (
  auth.role() = 'worker'
);
create policy worker_notes_update on public.notes for update to authenticated using (
  auth.role() = 'worker'
);
create policy worker_notes_delete on public.notes for delete to authenticated using (
  auth.role() = 'worker'
);

-- create trigger function to update timestamp
create function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- attach update timestamp trigger on tables
create trigger set_timestamp_profiles before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_timestamp_visits before update on public.visits for each row execute function public.set_updated_at();
create trigger set_timestamp_work_schedule before update on public.work_schedule for each row execute function public.set_updated_at();
create trigger set_timestamp_time_blocks before update on public.time_blocks for each row execute function public.set_updated_at();

-- create trigger function to set visit_type on insert
create function public.set_visit_type() returns trigger language plpgsql as $$
begin
  -- use exists() to stop at first matching row, reducing full-table scan overhead
  if not exists (
    select 1 from public.visits
    where patient_id = new.patient_id
      and deleted_at is null
  ) then
    new.visit_type := 'first_time';
  else
    new.visit_type := 'follow_up';
  end if;
  return new;
end;
$$;

-- attach visit_type trigger
create trigger set_visit_type_before_insert before insert on public.visits for each row execute function public.set_visit_type(); 