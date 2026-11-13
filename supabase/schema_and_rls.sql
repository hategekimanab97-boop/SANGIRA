-- ============================================================================
-- Sangira Hospitality Platform — Supabase PostgreSQL Schema & Row-Level Security
-- ============================================================================
-- Run this SQL inside your Supabase SQL Editor to initialize Better Auth
-- identity tables, multi-tenant hospitality tables, and PostgreSQL RLS policies.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Better Auth Core Tables + Sangira Staff Extensions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'HOTEL_MANAGER',
  business_id TEXT DEFAULT 'biz-grand-kigali',
  department TEXT DEFAULT 'Executive Management',
  phone TEXT DEFAULT '+250 788 000 000',
  employee_id TEXT DEFAULT 'EMP-01'
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. Multi-Tenant Hospitality Domain Tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hotel', 'restaurant', 'bar', 'lounge')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  location TEXT NOT NULL,
  city TEXT DEFAULT 'Kigali',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RWF',
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0.18,
  has_hotel_module BOOLEAN NOT NULL DEFAULT FALSE,
  table_count INTEGER NOT NULL DEFAULT 12,
  cover_image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_applications (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('hotel', 'restaurant', 'bar', 'lounge')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  documents JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT ARRAY['SERVER']::TEXT[],
  employment_status TEXT NOT NULL DEFAULT 'active',
  shift_status TEXT NOT NULL DEFAULT 'off_duty',
  last_activity TEXT,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_shifts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  clock_in TEXT NOT NULL,
  clock_out TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  verification_method TEXT NOT NULL DEFAULT 'pin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  central_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  kitchen_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  bar_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_threshold NUMERIC(12,3) NOT NULL DEFAULT 5,
  cost_per_unit NUMERIC(12,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  expiry_date TEXT,
  batch_number TEXT,
  storage_location TEXT
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('kitchen', 'bar')),
  description TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  prep_time_minutes INTEGER NOT NULL DEFAULT 15,
  recipe_id TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL,
  menu_item_name TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('kitchen', 'bar')),
  serving_size TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  table_number TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  order_type TEXT NOT NULL DEFAULT 'dine_in',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  server_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS department_tickets (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  table_number TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('kitchen', 'bar')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_staff TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ready_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  table_number TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_ref TEXT,
  customer_phone_or_name TEXT,
  customer_email TEXT,
  verified_by TEXT,
  notes TEXT,
  transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  business_id TEXT,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_dispatch_logs (
  id TEXT PRIMARY KEY,
  business_id TEXT,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'skipped_missing_key', 'failed')),
  provider_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. PostgreSQL Row-Level Security (RLS) Policies
-- ----------------------------------------------------------------------------
-- Helper expressions read session-scoped parameters set by the Express API
-- middleware from verified Better Auth sessions:
--   SET LOCAL app.current_user_id = '...';
--   SET LOCAL app.current_business_id = '...';
--   SET LOCAL app.current_role = '...';

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- Public & authenticated read for active venues & menus
CREATE POLICY businesses_public_read ON businesses
  FOR SELECT USING (status = 'active' OR current_setting('app.current_role', true) = 'SYSTEM_ADMIN');

CREATE POLICY businesses_admin_manage ON businesses
  FOR ALL USING (current_setting('app.current_role', true) = 'SYSTEM_ADMIN');

CREATE POLICY menu_public_read ON menu_items
  FOR SELECT USING (TRUE);

CREATE POLICY menu_tenant_manage ON menu_items
  FOR ALL USING (
    current_setting('app.current_role', true) IN ('SYSTEM_ADMIN', 'HOTEL_MANAGER', 'KITCHEN_MANAGER', 'BAR_MANAGER')
    AND (current_setting('app.current_role', true) = 'SYSTEM_ADMIN' OR business_id = current_setting('app.current_business_id', true))
  );

-- Applications: prospective owners can submit; only SYSTEM_ADMIN reviews/updates
CREATE POLICY applications_public_insert ON business_applications
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY applications_admin_all ON business_applications
  FOR ALL USING (current_setting('app.current_role', true) = 'SYSTEM_ADMIN');

-- Multi-tenant staff isolation by business_id
CREATE POLICY employees_tenant_isolation ON employees
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
  );

CREATE POLICY shifts_tenant_isolation ON staff_shifts
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
  );

CREATE POLICY stock_tenant_isolation ON stock_items
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
  );

CREATE POLICY movements_tenant_isolation ON stock_movements
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
  );

CREATE POLICY recipes_tenant_isolation ON recipes
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
  );

-- Orders & Tickets: guests may insert/track orders; staff scoped by business_id
CREATE POLICY orders_guest_insert ON orders
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY orders_tenant_read_update ON orders
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
    OR current_setting('app.current_role', true) = 'PUBLIC_GUEST'
  );

CREATE POLICY tickets_tenant_isolation ON department_tickets
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
    OR current_setting('app.current_role', true) = 'PUBLIC_GUEST'
  );

-- Payments: only CASHIER, HOTEL_MANAGER, or SYSTEM_ADMIN can verify/update settlements
CREATE POLICY payments_guest_insert ON payments
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY payments_tenant_read ON payments
  FOR SELECT USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
  );

CREATE POLICY payments_cashier_update ON payments
  FOR UPDATE USING (
    current_setting('app.current_role', true) IN ('SYSTEM_ADMIN', 'HOTEL_MANAGER', 'CASHIER')
    AND (current_setting('app.current_role', true) = 'SYSTEM_ADMIN' OR business_id = current_setting('app.current_business_id', true))
  );

CREATE POLICY audit_tenant_isolation ON audit_logs
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
    OR current_setting('app.current_role', true) = 'PUBLIC_GUEST'
  );

CREATE POLICY email_logs_tenant_isolation ON email_dispatch_logs
  FOR ALL USING (
    current_setting('app.current_role', true) = 'SYSTEM_ADMIN'
    OR business_id = current_setting('app.current_business_id', true)
  );
