-- Migration: create get_next_available_slots RPC function
create or replace function get_next_available_slots(
  p_patient_id uuid,
  p_page integer default 1,
  p_limit integer default 10
) returns table(
  start_time timestamptz,
  end_time timestamptz
) as $$
BEGIN
  RETURN QUERY
  WITH params AS (
    -- Parametry: dynamiczne appointment_duration na podstawie historii pacjenta oraz paginacja
    SELECT
      CASE WHEN EXISTS (
        SELECT 1 FROM visits v WHERE v.patient_id = p_patient_id
      ) THEN 60 ELSE 120 END AS appointment_duration
  ),
  work AS (
    -- Godziny pracy za dzień D = teraz+24h
    SELECT ws.day_of_week,
           ws.start_time::time AS ws,
           ws.end_time::time   AS we
    FROM work_schedule ws
    WHERE ws.day_of_week = EXTRACT(DOW FROM now() + INTERVAL '24 hours')
  ),
  candidates AS (
    -- Generujemy pełne godziny od następnej pełnej godziny po teraz+24h
    SELECT
      generate_series(
        CASE
          WHEN date_trunc('hour', now() + INTERVAL '24 hours') < now() + INTERVAL '24 hours'
            THEN date_trunc('hour', now() + INTERVAL '24 hours') + INTERVAL '1 hour'
          ELSE date_trunc('hour', now() + INTERVAL '24 hours')
        END,
        date_trunc('day',    now() + INTERVAL '24 hours') + w.we - (p.appointment_duration || ' minutes')::interval,
        '1 hour'
      ) AS start_time,
      p.appointment_duration
    FROM work w
    CROSS JOIN params p
  ),
  filtered AS (
    SELECT
      c.start_time,
      c.start_time + (c.appointment_duration || ' minutes')::interval AS end_time
    FROM candidates c
    JOIN work w
      ON EXTRACT(DOW FROM c.start_time)::int = w.day_of_week
     AND c.start_time::time >= w.ws
     AND (c.start_time + (c.appointment_duration || ' minutes')::interval)::time <= w.we
    WHERE NOT EXISTS (
      SELECT 1 FROM visits v
      WHERE v.start_time < c.start_time + (c.appointment_duration || ' minutes')::interval
        AND v.end_time   > c.start_time
    )
      AND NOT EXISTS (
      SELECT 1 FROM time_blocks tb
      WHERE tb.start_time < c.start_time + (c.appointment_duration || ' minutes')::interval
        AND tb.end_time   > c.start_time
    )
  )
  SELECT f.start_time, f.end_time
  FROM filtered f
  ORDER BY f.start_time
  OFFSET (p_page - 1) * p_limit
  LIMIT p_limit;
END;
$$ language plpgsql STABLE;

-- Create get_visit_type RPC function, zwraca typ wizyty na podstawie historii pacjenta
create or replace function get_visit_type(
  p_patient_id uuid
) returns text as $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM visits WHERE patient_id = p_patient_id
  ) THEN
    RETURN 'follow_up';
  ELSE
    RETURN 'first_time';
  END IF;
END;
$$ language plpgsql STABLE; 