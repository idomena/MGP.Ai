-- Extend user_preferences with onboarding fields collected during the
-- conversational onboarding flow. All columns are nullable so existing
-- rows are unaffected.

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS weight_value    NUMERIC,
  ADD COLUMN IF NOT EXISTS weight_unit     TEXT DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS goals           TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience      TEXT,
  ADD COLUMN IF NOT EXISTS gender          TEXT,
  ADD COLUMN IF NOT EXISTS assistant_type  TEXT DEFAULT 'coach',
  ADD COLUMN IF NOT EXISTS user_name       TEXT,
  ADD COLUMN IF NOT EXISTS coach_name      TEXT;
