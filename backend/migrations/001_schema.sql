-- ============================================================
-- Marina Pearl Dental Clinic — schema
-- All tables and helpers use the mp_ prefix so this can coexist
-- safely with other demos in the same Supabase project.
-- Run this first. Requires the auth schema Supabase provides.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- mp_profiles ----------
create table if not exists public.mp_profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    role        text not null default 'staff' check (role in ('patient', 'staff')),
    full_name   text,
    phone       text,
    created_at  timestamptz not null default now()
);

-- ---------- mp_doctors ----------
create table if not exists public.mp_doctors (
    id             uuid primary key default gen_random_uuid(),
    name           text not null,
    credentials    text,
    specialty      text,
    bio            text,
    photo_url      text,
    languages      text[] default '{English}',
    -- working_hours: keys are 0..6 (Sun=0 .. Sat=6), values { open, close } as HH:MM strings.
    -- null day = closed.
    working_hours  jsonb not null default '{
        "0": {"open": "09:00", "close": "21:00"},
        "1": {"open": "09:00", "close": "21:00"},
        "2": {"open": "09:00", "close": "21:00"},
        "3": {"open": "09:00", "close": "21:00"},
        "4": {"open": "09:00", "close": "21:00"},
        "5": {"open": "14:00", "close": "21:00"},
        "6": {"open": "09:00", "close": "21:00"}
    }'::jsonb,
    is_active      boolean not null default true,
    created_at     timestamptz not null default now()
);

-- ---------- mp_services ----------
create table if not exists public.mp_services (
    id             uuid primary key default gen_random_uuid(),
    name           text not null,
    slug           text not null unique,
    description    text,
    duration_min   int  not null default 30 check (duration_min > 0),
    price_min_aed  int  not null default 0,
    price_max_aed  int  not null default 0,
    is_active      boolean not null default true,
    sort_order     int  not null default 0,
    created_at     timestamptz not null default now()
);

-- ---------- mp_appointments ----------
create table if not exists public.mp_appointments (
    id                  uuid primary key default gen_random_uuid(),
    patient_name        text not null,
    patient_email       text not null,
    patient_phone       text not null,
    patient_profile_id  uuid references public.mp_profiles(id) on delete set null,
    doctor_id           uuid not null references public.mp_doctors(id) on delete restrict,
    service_id          uuid not null references public.mp_services(id) on delete restrict,
    start_time          timestamptz not null,
    end_time            timestamptz not null,
    status              text not null default 'pending'
        check (status in ('pending','confirmed','completed','cancelled','no_show')),
    consent_given_at    timestamptz,
    reschedule_token    text not null unique default encode(gen_random_bytes(24), 'hex'),
    notes               text,
    created_at          timestamptz not null default now(),
    check (end_time > start_time)
);

create index if not exists mp_appointments_doctor_start_idx on public.mp_appointments(doctor_id, start_time);
create index if not exists mp_appointments_status_idx       on public.mp_appointments(status);
create index if not exists mp_appointments_start_idx        on public.mp_appointments(start_time);
create index if not exists mp_appointments_profile_idx      on public.mp_appointments(patient_profile_id);

-- ---------- mp_holidays ----------
create table if not exists public.mp_holidays (
    id      uuid primary key default gen_random_uuid(),
    date    date not null unique,
    reason  text
);

-- ---------- mp_settings ----------
-- Single-row settings table for clinic-wide config the staff can edit.
create table if not exists public.mp_settings (
    id            int primary key default 1 check (id = 1),
    clinic_hours  jsonb not null default '{
        "0": {"open": "09:00", "close": "21:00"},
        "1": {"open": "09:00", "close": "21:00"},
        "2": {"open": "09:00", "close": "21:00"},
        "3": {"open": "09:00", "close": "21:00"},
        "4": {"open": "09:00", "close": "21:00"},
        "5": {"open": "14:00", "close": "21:00"},
        "6": {"open": "09:00", "close": "21:00"}
    }'::jsonb,
    updated_at    timestamptz not null default now()
);

insert into public.mp_settings (id) values (1) on conflict (id) do nothing;

-- NB: we intentionally do NOT create a trigger on auth.users. This project
-- shares its Supabase auth pool with other demos, so a trigger firing on
-- every signup would create orphan rows in mp_profiles for users that
-- belong to other projects. The seed script inserts the single staff row
-- directly instead.
