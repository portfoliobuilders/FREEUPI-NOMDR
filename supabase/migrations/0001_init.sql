-- FREEUPI schema
-- Money is stored as bigint paise. Status updates are application-recorded,
-- not bank settlement confirmations.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  business_name text,
  upi_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  merchant_name text not null,
  upi_id text not null,
  total_amount_paise bigint not null check (total_amount_paise > 0),
  reference text not null,
  note text,
  status text not null default 'ready' check (
    status in ('ready', 'partially_paid', 'completed', 'expired', 'archived')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  sequence_number integer not null check (sequence_number > 0),
  amount_paise bigint not null check (amount_paise > 0),
  upi_uri text not null,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'expired', 'cancelled')
  ),
  manually_verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz
);

create unique index if not exists payment_requests_invoice_sequence_idx
  on public.payment_requests (invoice_id, sequence_number);

create index if not exists invoices_user_id_created_at_idx
  on public.invoices (user_id, created_at desc);

create index if not exists invoices_user_id_status_idx
  on public.invoices (user_id, status);

create index if not exists payment_requests_invoice_id_idx
  on public.payment_requests (invoice_id);

create index if not exists profiles_user_id_idx
  on public.profiles (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, business_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'business_name', ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_requests enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

create policy "Users can view own payment requests"
  on public.payment_requests for select
  using (
    exists (
      select 1
      from public.invoices
      where invoices.id = payment_requests.invoice_id
        and invoices.user_id = auth.uid()
    )
  );

create policy "Users can insert own payment requests"
  on public.payment_requests for insert
  with check (
    exists (
      select 1
      from public.invoices
      where invoices.id = payment_requests.invoice_id
        and invoices.user_id = auth.uid()
    )
  );

create policy "Users can update own payment requests"
  on public.payment_requests for update
  using (
    exists (
      select 1
      from public.invoices
      where invoices.id = payment_requests.invoice_id
        and invoices.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.invoices
      where invoices.id = payment_requests.invoice_id
        and invoices.user_id = auth.uid()
    )
  );

create policy "Users can delete own payment requests"
  on public.payment_requests for delete
  using (
    exists (
      select 1
      from public.invoices
      where invoices.id = payment_requests.invoice_id
        and invoices.user_id = auth.uid()
    )
  );
