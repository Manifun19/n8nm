-- ===========================================================================
-- AI FormMate — Phase 1 schema foundation
--
-- Principles:
--   * every user-owned row carries user_id and is protected by RLS
--   * created_at / updated_at on every table
--   * soft delete (deleted_at) on records a user must not lose accidentally
--   * changing external facts (exam rules) always carry source + verification
--   * no table stores OTPs, passwords or payment credentials
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enumerated types
-- ---------------------------------------------------------------------------
do $$ begin
  create type app_category as enum ('general', 'obc', 'sc', 'st', 'ews', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_gender as enum ('male', 'female', 'other', 'prefer_not_to_say');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_marital_status as enum ('single', 'married', 'other', 'prefer_not_to_say');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_education_level as enum
    ('class_10', 'class_12', 'diploma', 'graduation', 'post_graduation', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_verification_status as enum ('unverified', 'self_verified', 'needs_attention');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_application_status as enum (
    'draft', 'preparing', 'in_progress', 'review_required',
    'payment_pending', 'submitted', 'failed', 'correction_required', 'completed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_information_source as enum ('official', 'ai_interpretation', 'user_entered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_confidence as enum ('high', 'medium', 'low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_media_kind as enum ('photo', 'signature');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_plan as enum ('free', 'premium');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- users — application-level mirror of auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  display_name  text,
  locale        text not null default 'en',
  plan          app_plan not null default 'free',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- profiles — the reusable candidate profile
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null unique references public.users (id) on delete cascade,
  full_name                 text,
  name_as_per_certificate   text,
  father_name               text,
  mother_name               text,
  date_of_birth             date,
  gender                    app_gender,
  nationality               text,
  marital_status            app_marital_status,
  mobile                    text,
  email                     text,
  category                  app_category,
  category_other            text,
  permanent_address_line1   text,
  permanent_address_line2   text,
  permanent_state           text,
  permanent_district        text,
  permanent_tehsil          text,
  permanent_village_town    text,
  permanent_pin             text,
  correspondence_same_as_permanent boolean not null default true,
  correspondence_address_line1 text,
  correspondence_address_line2 text,
  correspondence_state      text,
  correspondence_district   text,
  correspondence_tehsil     text,
  correspondence_village_town text,
  correspondence_pin        text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  deleted_at                timestamptz
);

-- ---------------------------------------------------------------------------
-- education_records
-- ---------------------------------------------------------------------------
create table if not exists public.education_records (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  level               app_education_level not null,
  board_or_university text,
  institution         text,
  roll_number         text,
  registration_number text,
  passing_year        smallint,
  marks_obtained      numeric(8, 2),
  marks_total         numeric(8, 2),
  percentage          numeric(5, 2),
  cgpa                numeric(4, 2),
  subjects            text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,
  constraint education_passing_year_range
    check (passing_year is null or (passing_year between 1900 and 2200))
);

create index if not exists education_records_user_idx on public.education_records (user_id);

-- ---------------------------------------------------------------------------
-- document_categories — seeded reference data (readable by everyone)
-- ---------------------------------------------------------------------------
create table if not exists public.document_categories (
  key         text primary key,
  label_en    text not null,
  label_hi    text not null,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- documents — the document vault (files live in PRIVATE storage)
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  category_key        text not null references public.document_categories (key),
  name                text not null,
  storage_path        text not null,
  mime_type           text not null,
  size_bytes          bigint not null default 0,
  issue_date          date,
  expiry_date         date,
  verification_status app_verification_status not null default 'unverified',
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create index if not exists documents_user_idx on public.documents (user_id);
create index if not exists documents_category_idx on public.documents (user_id, category_key);

-- ---------------------------------------------------------------------------
-- photos / signatures — processed media prepared for an exam's rules
-- ---------------------------------------------------------------------------
create table if not exists public.photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  label         text,
  storage_path  text not null,
  mime_type     text not null,
  width_px      integer,
  height_px     integer,
  size_bytes    bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists photos_user_idx on public.photos (user_id);

create table if not exists public.signatures (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  label         text,
  storage_path  text not null,
  mime_type     text not null,
  width_px      integer,
  height_px     integer,
  size_bytes    bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists signatures_user_idx on public.signatures (user_id);

-- ---------------------------------------------------------------------------
-- exams / exam_sources / exam_rules — shared reference data
-- ---------------------------------------------------------------------------
create table if not exists public.exams (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  organization  text,
  official_url  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table if not exists public.exam_sources (
  id          uuid primary key default gen_random_uuid(),
  exam_id     uuid not null references public.exams (id) on delete cascade,
  url         text not null,
  title       text,
  kind        text not null default 'notification',
  verified_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists exam_sources_exam_idx on public.exam_sources (exam_id);

create table if not exists public.exam_rules (
  id                    uuid primary key default gen_random_uuid(),
  exam_id               uuid not null references public.exams (id) on delete cascade,
  post                  text,
  photo_format          text,
  photo_min_kb          integer,
  photo_max_kb          integer,
  photo_width_px        integer,
  photo_height_px       integer,
  signature_format      text,
  signature_min_kb      integer,
  signature_max_kb      integer,
  signature_width_px    integer,
  signature_height_px   integer,
  required_documents    jsonb not null default '[]'::jsonb,
  qualification_rules   jsonb not null default '{}'::jsonb,
  age_rules             jsonb not null default '{}'::jsonb,
  category_rules        jsonb not null default '{}'::jsonb,
  fee_information       jsonb not null default '{}'::jsonb,
  important_dates       jsonb not null default '{}'::jsonb,
  -- Provenance is mandatory: nothing changing may be presented without it.
  information_source    app_information_source not null default 'user_entered',
  confidence            app_confidence not null default 'low',
  source_url            text,
  source_id             uuid references public.exam_sources (id) on delete set null,
  last_verified_at      timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

create index if not exists exam_rules_exam_idx on public.exam_rules (exam_id);

-- ---------------------------------------------------------------------------
-- applications and their satellites
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  exam_id             uuid references public.exams (id) on delete set null,
  exam_name           text not null,
  organization        text,
  post                text,
  official_url        text,
  status              app_application_status not null default 'draft',
  application_number  text,
  application_date    date,
  deadline            date,
  -- Payment STATUS only. Payment credentials are never stored.
  payment_status      text,
  payment_reference   text,
  pdf_storage_path    text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create index if not exists applications_user_idx on public.applications (user_id);
create index if not exists applications_status_idx on public.applications (user_id, status);
create unique index if not exists applications_unique_number_idx
  on public.applications (user_id, exam_name, application_number)
  where application_number is not null and deleted_at is null;

create table if not exists public.application_fields (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id        uuid not null references public.users (id) on delete cascade,
  field_label    text not null,
  field_name     text,
  mapped_path    text,
  value          text,
  confidence     app_confidence not null default 'low',
  needs_user_input boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists application_fields_app_idx on public.application_fields (application_id);

create table if not exists public.application_documents (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id        uuid not null references public.users (id) on delete cascade,
  document_id    uuid references public.documents (id) on delete set null,
  photo_id       uuid references public.photos (id) on delete set null,
  signature_id   uuid references public.signatures (id) on delete set null,
  role           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint application_documents_one_target check (
    (document_id is not null)::int + (photo_id is not null)::int + (signature_id is not null)::int = 1
  )
);

create index if not exists application_documents_app_idx
  on public.application_documents (application_id);

create table if not exists public.application_events (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id        uuid not null references public.users (id) on delete cascade,
  event_type     text not null,
  message        text,
  metadata       jsonb not null default '{}'::jsonb,
  occurred_at    timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists application_events_app_idx
  on public.application_events (application_id, occurred_at desc);

create table if not exists public.screenshots (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete set null,
  name           text not null,
  storage_path   text not null,
  mime_type      text not null,
  size_bytes     bigint not null default 0,
  captured_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index if not exists screenshots_user_idx on public.screenshots (user_id);

-- ---------------------------------------------------------------------------
-- notifications / settings / ai sessions
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  kind           text not null,
  title          text not null,
  body           text,
  due_at         timestamptz,
  read_at        timestamptz,
  -- A notification may only claim to be official when it has a source.
  information_source app_information_source not null default 'user_entered',
  source_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index if not exists notifications_user_idx on public.notifications (user_id, due_at);

create table if not exists public.user_settings (
  user_id                uuid primary key references public.users (id) on delete cascade,
  locale                 text not null default 'en',
  theme                  text not null default 'system',
  -- External AI processing of documents is opt-in, never assumed.
  ai_external_consent    boolean not null default false,
  ai_consent_updated_at  timestamptz,
  notification_email     boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists public.ai_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete set null,
  purpose        text not null,
  provider       text not null,
  model          text,
  -- Token accounting only. Prompt/response bodies are deliberately not stored.
  input_tokens   integer not null default 0,
  output_tokens  integer not null default 0,
  succeeded      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists ai_sessions_user_idx on public.ai_sessions (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'users', 'profiles', 'education_records', 'document_categories', 'documents',
    'photos', 'signatures', 'exams', 'exam_sources', 'exam_rules', 'applications',
    'application_fields', 'application_documents', 'application_events',
    'screenshots', 'notifications', 'user_settings', 'ai_sessions'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- New auth user -> application rows
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.profiles (user_id, full_name, email)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (user_id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.users              enable row level security;
alter table public.profiles           enable row level security;
alter table public.education_records  enable row level security;
alter table public.document_categories enable row level security;
alter table public.documents          enable row level security;
alter table public.photos             enable row level security;
alter table public.signatures         enable row level security;
alter table public.exams              enable row level security;
alter table public.exam_sources       enable row level security;
alter table public.exam_rules         enable row level security;
alter table public.applications       enable row level security;
alter table public.application_fields enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_events enable row level security;
alter table public.screenshots        enable row level security;
alter table public.notifications      enable row level security;
alter table public.user_settings      enable row level security;
alter table public.ai_sessions        enable row level security;

-- Owner-only access for every user-owned table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'education_records', 'documents', 'photos', 'signatures', 'applications',
    'application_fields', 'application_documents', 'application_events',
    'screenshots', 'notifications', 'ai_sessions'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_owner_select', t);
    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id)',
      t || '_owner_select', t);

    execute format('drop policy if exists %I on public.%I', t || '_owner_insert', t);
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id)',
      t || '_owner_insert', t);

    execute format('drop policy if exists %I on public.%I', t || '_owner_update', t);
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id)
       with check (auth.uid() = user_id)', t || '_owner_update', t);

    execute format('drop policy if exists %I on public.%I', t || '_owner_delete', t);
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id)',
      t || '_owner_delete', t);
  end loop;
end $$;

-- users / profiles / user_settings are keyed differently.
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users for select using (auth.uid() = id);

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_owner_all on public.profiles;
create policy profiles_owner_all on public.profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists user_settings_owner_all on public.user_settings;
create policy user_settings_owner_all on public.user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reference data: readable by any signed-in user, writable only by
-- service-role/admin tooling (which bypasses RLS).
do $$
declare
  t text;
begin
  foreach t in array array['document_categories', 'exams', 'exam_sources', 'exam_rules']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (true)',
      t || '_read', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Seed: document categories
-- ---------------------------------------------------------------------------
insert into public.document_categories (key, label_en, label_hi, sort_order) values
  ('identity_aadhaar',        'Aadhaar / Identity',      'आधार / पहचान',            10),
  ('pan',                     'PAN',                     'पैन',                      20),
  ('marksheet_10',            '10th Marksheet',          '10वीं अंकपत्र',            30),
  ('certificate_10',          '10th Certificate',        '10वीं प्रमाणपत्र',          40),
  ('marksheet_12',            '12th Marksheet',          '12वीं अंकपत्र',            50),
  ('certificate_12',          '12th Certificate',        '12वीं प्रमाणपत्र',          60),
  ('graduation_marksheet',    'Graduation Marksheet',    'स्नातक अंकपत्र',           70),
  ('degree',                  'Degree',                  'डिग्री',                    80),
  ('caste_certificate',       'Caste Certificate',       'जाति प्रमाणपत्र',           90),
  ('ews_certificate',         'EWS Certificate',         'EWS प्रमाणपत्र',           100),
  ('domicile',                'Domicile',                'निवास प्रमाणपत्र',         110),
  ('ncl_certificate',         'NCL Certificate',         'NCL प्रमाणपत्र',           120),
  ('experience_certificate',  'Experience Certificate',  'अनुभव प्रमाणपत्र',         130),
  ('disability_certificate',  'Disability Certificate',  'दिव्यांगता प्रमाणपत्र',     140),
  ('other',                   'Other',                   'अन्य',                     150)
on conflict (key) do update
  set label_en = excluded.label_en,
      label_hi = excluded.label_hi,
      sort_order = excluded.sort_order;
