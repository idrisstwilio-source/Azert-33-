-- SQL Schema for SHM Reports and Sessions

-- 1. Table: reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT,
  time TEXT,
  objective TEXT,
  participants_boys INTEGER DEFAULT 0,
  participants_girls INTEGER DEFAULT 0,
  leaders_count INTEGER DEFAULT 0,
  responsible TEXT,
  category TEXT,
  beneficiary TEXT,
  description_original TEXT,
  description_reformulated TEXT,
  evaluation_positive TEXT,
  evaluation_negative TEXT,
  recommendations TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ,
  location TEXT,
  target_audience TEXT,
  objective TEXT,
  methodology_original TEXT,
  methodology_reformulated TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Buckets shm-reports and shm-sessions will be auto-created by the server 
-- if they don't exist (requires service role key).
