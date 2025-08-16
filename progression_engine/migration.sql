-- Progression Engine Database Migration
-- Adds session_logs and doms_surveys tables for enhanced progression algorithm

-- Session RPE Logging Table
CREATE TABLE session_logs (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  session_rpe SMALLINT CHECK (session_rpe BETWEEN 0 AND 10),
  total_load  NUMERIC DEFAULT 0,
  rpe_load    NUMERIC DEFAULT 0,
  notes       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- DOMS (Delayed Onset Muscle Soreness) Survey Table
CREATE TABLE doms_surveys (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  chest_soreness  SMALLINT CHECK (chest_soreness BETWEEN 0 AND 10) DEFAULT 0,
  back_soreness   SMALLINT CHECK (back_soreness BETWEEN 0 AND 10) DEFAULT 0,
  legs_soreness   SMALLINT CHECK (legs_soreness BETWEEN 0 AND 10) DEFAULT 0,
  arms_soreness   SMALLINT CHECK (arms_soreness BETWEEN 0 AND 10) DEFAULT 0,
  shoulders_soreness SMALLINT CHECK (shoulders_soreness BETWEEN 0 AND 10) DEFAULT 0,
  core_soreness   SMALLINT CHECK (core_soreness BETWEEN 0 AND 10) DEFAULT 0,
  overall_soreness SMALLINT CHECK (overall_soreness BETWEEN 0 AND 10) DEFAULT 0,
  sleep_quality   SMALLINT CHECK (sleep_quality BETWEEN 1 AND 10),
  energy_level    SMALLINT CHECK (energy_level BETWEEN 1 AND 10),
  motivation      SMALLINT CHECK (motivation BETWEEN 1 AND 10),
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Enhanced readiness metrics table (optional extension)
CREATE TABLE readiness_metrics (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  hrv_score         NUMERIC,
  resting_hr        INTEGER,
  sleep_score       NUMERIC,
  stress_level      SMALLINT CHECK (stress_level BETWEEN 1 AND 10),
  readiness_index   NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN hrv_score IS NOT NULL AND sleep_score IS NOT NULL THEN
        (0.4 * (hrv_score / 100) + 0.3 * (sleep_score / 100) + 0.3 * ((11 - stress_level) / 10))
      ELSE NULL
    END
  ) STORED,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Indexes for performance optimization
CREATE INDEX idx_session_logs_user_date ON session_logs(user_id, date DESC);
CREATE INDEX idx_doms_surveys_user_date ON doms_surveys(user_id, date DESC);
CREATE INDEX idx_readiness_metrics_user_date ON readiness_metrics(user_id, date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doms_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_logs
CREATE POLICY "Users can view own session logs" ON session_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own session logs" ON session_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own session logs" ON session_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own session logs" ON session_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for doms_surveys
CREATE POLICY "Users can view own DOMS surveys" ON doms_surveys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own DOMS surveys" ON doms_surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own DOMS surveys" ON doms_surveys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own DOMS surveys" ON doms_surveys FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for readiness_metrics
CREATE POLICY "Users can view own readiness metrics" ON readiness_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readiness metrics" ON readiness_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own readiness metrics" ON readiness_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own readiness metrics" ON readiness_metrics FOR DELETE USING (auth.uid() = user_id);

-- Insert trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_session_logs_updated_at BEFORE UPDATE ON session_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doms_surveys_updated_at BEFORE UPDATE ON doms_surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_readiness_metrics_updated_at BEFORE UPDATE ON readiness_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();