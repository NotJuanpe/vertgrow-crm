-- Recurring appointment series
-- Run in the Supabase SQL editor after 001_initial_schema.sql

CREATE TABLE recurring_series (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type                text        NOT NULL,
  duration_min        integer     NOT NULL DEFAULT 60,
  time                text        NOT NULL,  -- "HH:MM"
  recurrence          text        NOT NULL
                        CHECK (recurrence IN ('weekly', 'biweekly', 'monthly', 'twice-monthly')),
  day_of_month        integer     CHECK (day_of_month BETWEEN 1 AND 31),
  second_day_of_month integer     CHECK (second_day_of_month BETWEEN 1 AND 31),
  notes               text,
  starts_on           date        NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE appointments
  ADD COLUMN series_id uuid REFERENCES recurring_series(id) ON DELETE SET NULL;
