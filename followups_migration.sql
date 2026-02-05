
-- 1. Create Followups Table
create table if not exists followups (
  id uuid default uuid_generate_v4() primary key,
  -- De-normalized customer info for simplicity as requested
  customer_name text not null,
  customer_phone text not null,
  
  -- Reference to order (optional, but good for tracking)
  order_id uuid references orders(id) on delete set null,
  
  -- Core Logic
  type text check (type in ('reventa_pack', 'recompra')) not null,
  status text check (status in ('pending', 'sent')) default 'pending',
  due_date date not null,
  
  -- Metadata
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table followups enable row level security;

-- 3. Policies (Simple: Staff can do everything)
create policy "Staff can view followups" on followups for select using (true);

create policy "Staff can insert followups" on followups for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);

create policy "Staff can update followups" on followups for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);

create policy "Staff can delete followups" on followups for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);
