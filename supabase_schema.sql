-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Roles)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('admin', 'staff')) default 'staff',
  created_at timestamptz default now()
);

-- MEALS (Catalog)
create table meals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamptz default now()
);

-- ORDERS
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  phone text,
  order_type text check (order_type in ('single', 'pack5', 'pack10', 'other')) not null,
  other_label text, -- only if order_type = 'other'
  delivery boolean default false,
  status text check (status in ('pending', 'paid', 'delivered')) default 'pending',
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  total numeric not null default 0,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ORDER ITEMS (for meals tracking)
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  meal_id uuid references meals(id) on delete set null,
  qty integer default 1
);

-- RLS POLICIES

-- Profiles: 
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- Meals:
alter table meals enable row level security;
create policy "Staff can view meals" on meals for select using (true);
create policy "Admin can manage meals" on meals for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders:
alter table orders enable row level security;
create policy "Staff can view all orders" on orders for select using (true);
create policy "Staff can insert orders" on orders for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);
create policy "Staff can update orders" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);
-- Staff CANNOT delete orders (only Admin)
create policy "Admin can delete orders" on orders for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Order Items:
alter table order_items enable row level security;
create policy "Staff can view order items" on order_items for select using (true);
create policy "Staff can insert order items" on order_items for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);
create policy "Staff can update order items" on order_items for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);
create policy "Admin can delete order items" on order_items for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- SEED DATA
insert into meals (name) values 
('Chicken & Rice'), 
('Beef Stir Fry'), 
('Salmon Salad'), 
('Pasta Bolognese'), 
('Veggie Wrap');

-- Trigger to create profile on signup (optional but good for testing)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'staff'); -- Default to staff
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
