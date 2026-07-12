-- ============================================================
-- Row Level Security policies for the mp_* tables.
-- Uses mp_is_staff() so the helper name doesn't collide with
-- other demos in the same Supabase project.
-- ============================================================

alter table public.mp_profiles     enable row level security;
alter table public.mp_doctors      enable row level security;
alter table public.mp_services     enable row level security;
alter table public.mp_appointments enable row level security;
alter table public.mp_holidays     enable row level security;
alter table public.mp_settings     enable row level security;

-- helper: is caller staff?
create or replace function public.mp_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.mp_profiles p
        where p.id = auth.uid() and p.role = 'staff'
    );
$$;

-- ---------- mp_profiles ----------
drop policy if exists mp_profiles_self_read   on public.mp_profiles;
drop policy if exists mp_profiles_self_update on public.mp_profiles;
drop policy if exists mp_profiles_staff_all   on public.mp_profiles;

create policy mp_profiles_self_read   on public.mp_profiles
    for select using (auth.uid() = id);

create policy mp_profiles_self_update on public.mp_profiles
    for update using (auth.uid() = id);

create policy mp_profiles_staff_all   on public.mp_profiles
    for all using (public.mp_is_staff()) with check (public.mp_is_staff());

-- ---------- mp_doctors / mp_services / mp_holidays: public read for active, staff writes ----------
drop policy if exists mp_doctors_public_read  on public.mp_doctors;
drop policy if exists mp_doctors_staff_write  on public.mp_doctors;
create policy mp_doctors_public_read  on public.mp_doctors
    for select using (is_active = true or public.mp_is_staff());
create policy mp_doctors_staff_write  on public.mp_doctors
    for all using (public.mp_is_staff()) with check (public.mp_is_staff());

drop policy if exists mp_services_public_read on public.mp_services;
drop policy if exists mp_services_staff_write on public.mp_services;
create policy mp_services_public_read on public.mp_services
    for select using (is_active = true or public.mp_is_staff());
create policy mp_services_staff_write on public.mp_services
    for all using (public.mp_is_staff()) with check (public.mp_is_staff());

drop policy if exists mp_holidays_public_read on public.mp_holidays;
drop policy if exists mp_holidays_staff_write on public.mp_holidays;
create policy mp_holidays_public_read on public.mp_holidays
    for select using (true);
create policy mp_holidays_staff_write on public.mp_holidays
    for all using (public.mp_is_staff()) with check (public.mp_is_staff());

-- ---------- mp_appointments ----------
-- Anonymous direct access is blocked (guest booking + token-based lookup
-- go through the server, which uses the service role and bypasses RLS).
-- Staff sees all.
drop policy if exists mp_appointments_staff_all on public.mp_appointments;

create policy mp_appointments_staff_all on public.mp_appointments
    for all using (public.mp_is_staff()) with check (public.mp_is_staff());

-- ---------- mp_settings ----------
drop policy if exists mp_settings_public_read on public.mp_settings;
drop policy if exists mp_settings_staff_write on public.mp_settings;
create policy mp_settings_public_read on public.mp_settings
    for select using (true);
create policy mp_settings_staff_write on public.mp_settings
    for all using (public.mp_is_staff()) with check (public.mp_is_staff());
