-- community_setup.sql

-- 1. Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  description text,
  created_at timestamptz default now()
);

-- 2. Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now(),
  UNIQUE(community_id, user_id)
);

-- 3. Create carbon_reductions table
CREATE TABLE IF NOT EXISTS public.carbon_reductions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  community_id uuid references public.communities(id) on delete cascade not null,
  activity_id uuid references public.activities(id) on delete set null,
  category text,
  reduction_amount numeric not null CHECK (reduction_amount >= 0),
  created_at timestamptz default now()
);

-- 4. Create community_feed table
CREATE TABLE IF NOT EXISTS public.community_feed (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  event_type text,
  message text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- 5. Create community_achievements table
CREATE TABLE IF NOT EXISTS public.community_achievements (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade not null,
  badge_name text not null,
  badge_description text,
  achieved_at timestamptz default now()
);

-- 6. Create community_insights table
CREATE TABLE IF NOT EXISTS public.community_insights (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade not null,
  insight text not null,
  week_start date,
  created_at timestamptz default now()
);

-- RLS Policies
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public communities are viewable by everyone" ON public.communities FOR SELECT USING (true);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members are viewable by everyone" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.carbon_reductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reductions are viewable by everyone" ON public.carbon_reductions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reductions" ON public.carbon_reductions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.community_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feed is viewable by everyone" ON public.community_feed FOR SELECT USING (true);
CREATE POLICY "System can insert feed" ON public.community_feed FOR INSERT WITH CHECK (true); -- Usually restricted to service role or authenticated users

ALTER TABLE public.community_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are viewable by everyone" ON public.community_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert achievements" ON public.community_achievements FOR INSERT WITH CHECK (true);

ALTER TABLE public.community_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insights are viewable by everyone" ON public.community_insights FOR SELECT USING (true);
CREATE POLICY "System can insert insights" ON public.community_insights FOR INSERT WITH CHECK (true);

-- Enable Realtime
-- Drop publication if it exists to avoid errors, then recreate
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_reductions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_achievements;

-- Set REPLICA IDENTITY FULL for realtime deletes/updates if needed
ALTER TABLE public.carbon_reductions REPLICA IDENTITY FULL;
ALTER TABLE public.community_feed REPLICA IDENTITY FULL;
ALTER TABLE public.community_achievements REPLICA IDENTITY FULL;

-- Seed Data (for the Demo)
INSERT INTO public.communities (name, type, description)
VALUES 
  ('Hostel A', 'Hostel', 'The most sustainable hostel on campus'),
  ('Hostel B', 'Hostel', 'Eco-friendly living at Hostel B'),
  ('CSE Department', 'Department', 'Computer Science and Engineering'),
  ('ECE Department', 'Department', 'Electronics and Communication Engineering')
ON CONFLICT DO NOTHING;
