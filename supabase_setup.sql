-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  monthly_goal_kg numeric default 200,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  icon text,
  color text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete cascade not null,
  description text not null,
  amount numeric not null,
  unit text not null,
  co2_kg numeric not null,
  logged_at timestamp with time zone not null,
  source text default 'manual',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure the source column exists if the table was created previously without it
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS source text default 'manual';

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON activities FOR DELETE USING (auth.uid() = user_id);

-- Create uploads table
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  image_url text not null,
  document_type text,
  processing_status text not null default 'pending',
  extracted_json jsonb,
  confidence_score numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own uploads" ON uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON uploads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON uploads FOR DELETE USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO public.categories (name, color) VALUES
  ('Transport', '#3b82f6'),
  ('Food', '#10b981'),
  ('Energy', '#f59e0b'),
  ('Shopping', '#8b5cf6'),
  ('Waste', '#64748b'),
  ('Other', '#94a3b8')
ON CONFLICT (name) DO NOTHING;
