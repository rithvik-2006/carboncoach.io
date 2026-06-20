-- Performance Indexes for Carbon Coach

-- Index on user_id for faster activity queries
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities (user_id);

-- Index on logged_at for faster time-series queries
CREATE INDEX IF NOT EXISTS idx_activities_logged_at ON public.activities (logged_at DESC);

-- Index on user_id for the global_carbon_reductions table
CREATE INDEX IF NOT EXISTS idx_global_carbon_reductions_user_id ON public.global_carbon_reductions (user_id);

-- Index on created_at for time window queries (weekly, monthly leaderboard)
CREATE INDEX IF NOT EXISTS idx_global_carbon_reductions_created_at ON public.global_carbon_reductions (created_at DESC);

-- Index on co2_kg if needed for leaderboard sorting
CREATE INDEX IF NOT EXISTS idx_activities_co2_kg ON public.activities (co2_kg);
