-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  username      TEXT UNIQUE,
  phone         TEXT,
  gender        TEXT,
  date_of_birth DATE,
  role          TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.addresses (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  house_street TEXT,
  barangay     TEXT,
  city         TEXT,
  province     TEXT,
  postal_code  TEXT,
  country      TEXT DEFAULT 'Philippines'
);

CREATE TABLE public.medical_records (
  id                        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id                UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  has_allergies             BOOLEAN DEFAULT FALSE,
  allergy_details           TEXT,
  has_chronic_conditions    BOOLEAN DEFAULT FALSE,
  chronic_condition_details TEXT,
  has_skin_conditions       BOOLEAN DEFAULT FALSE,
  skin_conditions           TEXT[],
  skin_type                 TEXT,
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.services (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name             TEXT UNIQUE NOT NULL,
  duration_minutes INTEGER,
  is_archived      BOOLEAN DEFAULT FALSE,
  archived_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.treatments (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id  UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2),
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.products (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT NOT NULL,
  description         TEXT,
  category            TEXT,
  price               NUMERIC(10,2),
  quantity            INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_archived         BOOLEAN DEFAULT FALSE,
  archived_at         TIMESTAMPTZ,
  updated_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.appointments (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  total_price      NUMERIC(10,2),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','completed','cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.appointment_services (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  service_id     UUID REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
  quantity       INTEGER DEFAULT 1,
  unit_price     NUMERIC(10,2)
);

CREATE TABLE public.cancellation_requests (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  requested_by   UUID REFERENCES auth.users(id) NOT NULL,
  reason         TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
  reviewed_at    TIMESTAMPTZ,
  reviewed_by    UUID REFERENCES auth.users(id),
  requested_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- addresses
CREATE POLICY "addresses_all" ON public.addresses FOR ALL
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
         OR public.is_admin());

-- medical_records
CREATE POLICY "medical_records_all" ON public.medical_records FOR ALL
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
         OR public.is_admin());

-- services (read for authenticated, write for admins only)
CREATE POLICY "services_select" ON public.services
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "services_write" ON public.services
  FOR ALL USING (public.is_admin());

-- treatments
CREATE POLICY "treatments_select" ON public.treatments
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "treatments_write" ON public.treatments
  FOR ALL USING (public.is_admin());

-- products
CREATE POLICY "products_select" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "products_write" ON public.products
  FOR ALL USING (public.is_admin());

-- appointments
CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );
CREATE POLICY "appointments_insert" ON public.appointments
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "appointments_update" ON public.appointments
  FOR UPDATE USING (
    client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );
CREATE POLICY "appointments_admin_delete" ON public.appointments
  FOR DELETE USING (public.is_admin());

-- appointment_services
CREATE POLICY "appt_services_select" ON public.appointment_services
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM public.appointments
      WHERE client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    ) OR public.is_admin()
  );
CREATE POLICY "appt_services_insert" ON public.appointment_services
  FOR INSERT WITH CHECK (
    appointment_id IN (
      SELECT id FROM public.appointments
      WHERE client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- cancellation_requests
CREATE POLICY "cancel_req_select" ON public.cancellation_requests
  FOR SELECT USING (requested_by = auth.uid() OR public.is_admin());
CREATE POLICY "cancel_req_insert" ON public.cancellation_requests
  FOR INSERT WITH CHECK (requested_by = auth.uid());
CREATE POLICY "cancel_req_admin" ON public.cancellation_requests
  FOR ALL USING (public.is_admin());

-- ─── AUTO-UPDATE updated_at TRIGGERS ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
