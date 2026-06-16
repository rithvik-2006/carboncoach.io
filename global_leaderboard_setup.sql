-- global_leaderboard_setup.sql

-- 1. Create global_carbon_reductions table
CREATE TABLE IF NOT EXISTS public.global_carbon_reductions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_id uuid references public.activities(id) on delete set null,
  category text,
  reduction_amount numeric not null CHECK (reduction_amount > 0),
  created_at timestamptz default now()
);

-- 2. Create global_activity_feed table
CREATE TABLE IF NOT EXISTS public.global_activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text,
  message text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- 3. Create global_achievements table
CREATE TABLE IF NOT EXISTS public.global_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_name text not null,
  badge_description text,
  achieved_at timestamptz default now()
);

-- 4. Create global_ai_insights table
CREATE TABLE IF NOT EXISTS public.global_ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  insight text not null,
  created_at timestamptz default now()
);

-- RLS Policies
ALTER TABLE public.global_carbon_reductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reductions are viewable by everyone" ON public.global_carbon_reductions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reductions" ON public.global_carbon_reductions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.global_activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feed is viewable by everyone" ON public.global_activity_feed FOR SELECT USING (true);
CREATE POLICY "System can insert feed" ON public.global_activity_feed FOR INSERT WITH CHECK (true);

ALTER TABLE public.global_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are viewable by everyone" ON public.global_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert achievements" ON public.global_achievements FOR INSERT WITH CHECK (true);

ALTER TABLE public.global_ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.global_ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert insights" ON public.global_ai_insights FOR INSERT WITH CHECK (true);

-- Enable Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.global_carbon_reductions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_achievements;

-- Set REPLICA IDENTITY FULL for realtime
ALTER TABLE public.global_carbon_reductions REPLICA IDENTITY FULL;
ALTER TABLE public.global_activity_feed REPLICA IDENTITY FULL;
ALTER TABLE public.global_achievements REPLICA IDENTITY FULL;
