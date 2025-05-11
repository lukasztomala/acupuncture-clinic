1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

- profiles

  - user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - role role_enum NOT NULL
  - first_name TEXT NOT NULL
  - last_name TEXT NOT NULL
  - phone TEXT NOT NULL
  - date_of_birth DATE NOT NULL
  - deleted_at TIMESTAMPTZ NULL
  - created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

- visits

  - id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - patient_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE NO ACTION
  - start_time TIMESTAMPTZ NOT NULL
  - end_time TIMESTAMPTZ NOT NULL
  - purpose TEXT NULL
  - status status_enum NOT NULL DEFAULT 'scheduled'
  - visit_type visit_type_enum NOT NULL
  - deleted_at TIMESTAMPTZ NULL
  - created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - CHECK (start_time < end_time)
  - EXCLUDE USING gist (tsrange(start_time, end_time) WITH &&)

- work_schedule

  - id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - day_of_week SMALLINT NOT NULL
  - start_time TIME NOT NULL
  - end_time TIME NOT NULL
  - CHECK (start_time < end_time)
  - UNIQUE (day_of_week, start_time, end_time)

- time_blocks

  - id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - start_time TIMESTAMPTZ NOT NULL
  - end_time TIMESTAMPTZ NOT NULL
  - created_by UUID NOT NULL REFERENCES profiles(user_id) ON DELETE NO ACTION
  - created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - CHECK (start_time < end_time)

- notes
  - id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - visit_id UUID REFERENCES visits(id) ON DELETE NO ACTION NULLABLE
  - patient_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE NO ACTION
  - author_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE NO ACTION
  - content TEXT NOT NULL
  - created_at TIMESTAMPTZ NOT NULL DEFAULT now()

2. Relacje między tabelami

- profiles (1) ← visits (N)
- visits (1) ← notes (N)
- profiles (1) ← notes (N)
- work_schedule: wzorzec tygodniowy, niezależny od wizyt
- time_blocks: niezależne od wizyt, mogą się nakładać

3. Indeksy

- btree ON visits(patient_id)
- btree ON visits(start_time)
- btree ON visits(end_time)
- btree ON visits(status)
- GiST ON tsrange(start_time, end_time) w visits
- btree ON work_schedule(day_of_week)
- btree ON time_blocks(start_time)
- btree ON time_blocks(end_time)
- btree ON notes(visit_id)
- btree ON notes(patient_id)
- btree ON notes(author_id)

4. Zasady PostgreSQL (RLS)

- profiles: enable RLS

  - policy "patient_self": SELECT, UPDATE WHEN auth.uid() = user_id AND deleted_at IS NULL
  - policy "worker_all": SELECT, UPDATE WHEN auth.role() = 'worker'

- visits: enable RLS

  - policy "patient_visits": SELECT, INSERT, UPDATE, DELETE WHEN auth.uid() = patient_id AND deleted_at IS NULL
  - policy "worker_visits": SELECT, INSERT, UPDATE, DELETE WHEN auth.role() = 'worker'

- notes: enable RLS
  - policy "worker_notes": SELECT, INSERT, UPDATE, DELETE WHEN auth.role() = 'worker'

5. Dodatkowe uwagi

- extension "uuid-ossp" do generowania UUID
- triggers do automatycznego ustawiania created_at i updated_at we wszystkich tabelach
- trigger BEFORE INSERT w visits do wyliczania visit_type_enum na podstawie wcześniejszych wizyt
- użycie TRANSACTION ISOLATION LEVEL SERIALIZABLE lub SELECT FOR UPDATE przy rezerwacji wizyt, aby zapobiec race conditions
- wszystkie znaczniki czasowe jako TIMESTAMP WITH TIME ZONE dla spójności strefy czasowej
