-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create tables
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  role text not null default 'user' check (role in ('admin', 'user', 'support')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  department text,
  market text,
  status text not null default 'pending' check (status in ('active', 'pending', 'inactive'))
);

create table public.help_articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  category text not null,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_index integer default 0
);

-- Create indexes
create index users_market_idx on public.users(market);
create index users_status_idx on public.users(status);
create index help_articles_featured_idx on public.help_articles(is_featured);
create index help_articles_order_idx on public.help_articles(order_index);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.help_articles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Admin and support can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'support')
    )
  );

create policy "Only admins can manage users"
  on public.users for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Anyone can view help articles"
  on public.help_articles for select
  using (true);

create policy "Only admins can manage help articles"
  on public.help_articles for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Insert initial help articles
insert into public.help_articles (title, content, category, is_featured, order_index) values
('Cómo crear un ticket', 'Siga estos pasos para crear un nuevo ticket de soporte...', 'general', true, 1),
('Gestión de accesos', 'Información sobre la gestión de accesos y permisos...', 'access', true, 2),
('Políticas de seguridad', 'Directrices importantes sobre seguridad...', 'security', true, 3);