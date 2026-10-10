-- Supabase SQL Schema for GLADYNS Store
-- Paste this entire file into the Supabase SQL Editor and click "Run"

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  "id" text PRIMARY KEY,
  "firstName" text,
  "lastName" text,
  "email" text,
  "phone" text,
  "memberSince" text,
  "tier" text,
  "loyaltyPoints" integer DEFAULT 0,
  "lifetimePoints" integer DEFAULT 0,
  "pointsHistory" jsonb DEFAULT '[]'::jsonb,
  "addresses" jsonb DEFAULT '[]'::jsonb,
  "preferences" jsonb DEFAULT '{}'::jsonb,
  "registeredDateExact" text,
  "registrationDetails" jsonb DEFAULT '{}'::jsonb,
  "deviceInfo" jsonb DEFAULT '{}'::jsonb,
  "location" jsonb DEFAULT '{}'::jsonb,
  "sessionStatus" text,
  "lastSeen" text,
  "sessionDurationMinutes" integer DEFAULT 0,
  "recentActivity" jsonb DEFAULT '[]'::jsonb,
  "cart_items" jsonb DEFAULT '[]'::jsonb,
  "wishlist_ids" jsonb DEFAULT '[]'::jsonb,
  "updated_at" timestamp with time zone DEFAULT now()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  "id" text PRIMARY KEY,
  "slug" text,
  "name" text,
  "subtitle" text,
  "tagline" text,
  "price" numeric,
  "originalPrice" numeric,
  "category" text,
  "categoryLabel" text,
  "department" text,
  "warranty" text,
  "condition" text DEFAULT 'Brand New',
  "specs" jsonb DEFAULT '[]'::jsonb,
  "brand" text,
  "brandOrigin" text,
  "tag" text,
  "isNewArrival" boolean DEFAULT false,
  "isHotDeal" boolean DEFAULT false,
  "discountPercentage" numeric DEFAULT 0,
  "dealEndsIn" text,
  "description" text,
  "details" jsonb DEFAULT '[]'::jsonb,
  "materials" text,
  "care" text,
  "primaryImage" text,
  "images" jsonb DEFAULT '[]'::jsonb,
  "colors" jsonb DEFAULT '[]'::jsonb,
  "sizes" jsonb DEFAULT '[]'::jsonb,
  "rating" numeric DEFAULT 0,
  "reviewCount" integer DEFAULT 0,
  "reviews" jsonb DEFAULT '[]'::jsonb,
  "featured" boolean DEFAULT false,
  "modelInfo" text,
  "madeIn" text,
  "sku" text,
  "barcode" text,
  "stockLevel" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  "id" text PRIMARY KEY,
  "orderNumber" text,
  "customerId" text,
  "date" text,
  "items" jsonb DEFAULT '[]'::jsonb,
  "shippingAddress" jsonb DEFAULT '{}'::jsonb,
  "shippingMethod" text,
  "shippingCost" numeric DEFAULT 0,
  "subtotal" numeric DEFAULT 0,
  "discount" numeric DEFAULT 0,
  "tax" numeric DEFAULT 0,
  "total" numeric DEFAULT 0,
  "paymentMethod" text,
  "status" text DEFAULT 'placed',
  "trackingNumber" text,
  "carrier" text,
  "estimatedDelivery" text,
  "timeline" jsonb DEFAULT '[]'::jsonb,
  "cancelledAt" text,
  "cancelReason" text,
  "returnRequested" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  "id" text PRIMARY KEY,
  "title" text,
  "message" text,
  "timestamp" numeric,
  "read" boolean DEFAULT false,
  "type" text,
  "linkTarget" text,
  "customerId" text,
  "isAdminOnly" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

-- 5. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  "id" text PRIMARY KEY,
  "config" jsonb DEFAULT '{}'::jsonb,
  "updated_at" timestamp with time zone DEFAULT now()
);

-- 6. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  "id" text PRIMARY KEY,
  "label" text,
  "description" text,
  "image" text,
  "badge" text
);

-- 7. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
  "name" text PRIMARY KEY,
  "origin" text
);

-- 8. SCHEMA MIGRATION / ALTER COLUMNS FOR EXISTING TABLES
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "customerId" text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "customerId" text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "isAdminOnly" boolean DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

-- 9. DISABLE ROW LEVEL SECURITY (RLS) FOR UNRESTRICTED ANONYMOUS ACCESS
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands DISABLE ROW LEVEL SECURITY;

-- 10. REALTIME REPLICATION SETUP (Safely ignored if already member)
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.products; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.users; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.settings; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.categories; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.brands; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 11. AUTOMATIC CUSTOMER ACCOUNT SYNC & INSTANT ACTIVATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name text;
  v_first_name text;
  v_last_name text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  IF v_full_name <> '' THEN
    v_first_name := SPLIT_PART(v_full_name, ' ', 1);
    v_last_name := TRIM(SUBSTRING(v_full_name FROM LENGTH(v_first_name) + 1));
  ELSE
    v_first_name := SPLIT_PART(NEW.email, '@', 1);
    v_last_name := '';
  END IF;

  INSERT INTO public.users (
    "id",
    "firstName",
    "lastName",
    "email",
    "memberSince",
    "tier",
    "loyaltyPoints",
    "lifetimePoints",
    "registeredDateExact",
    "sessionStatus",
    "lastSeen",
    "cart_items",
    "wishlist_ids",
    "updated_at"
  )
  VALUES (
    NEW.id::text,
    v_first_name,
    v_last_name,
    NEW.email,
    TO_CHAR(NOW(), 'Mon YYYY'),
    'Bronze VIP',
    100,
    100,
    TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
    'online',
    'Active Now',
    '[]'::jsonb,
    '[]'::jsonb,
    NOW()
  )
  ON CONFLICT ("id") DO UPDATE SET
    "email" = EXCLUDED."email",
    "firstName" = CASE WHEN public.users."firstName" IS NULL OR public.users."firstName" = '' THEN EXCLUDED."firstName" ELSE public.users."firstName" END,
    "lastName" = CASE WHEN public.users."lastName" IS NULL OR public.users."lastName" = '' THEN EXCLUDED."lastName" ELSE public.users."lastName" END,
    "sessionStatus" = 'online',
    "lastSeen" = 'Active Now',
    "updated_at" = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_new_auth_user ON auth.users;
CREATE TRIGGER trigger_sync_new_auth_user
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Auto-confirm trigger (only updates email_confirmed_at since confirmed_at is a generated column)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_confirm_auth_user ON auth.users;
CREATE TRIGGER trigger_auto_confirm_auth_user
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- Retroactively auto-confirm existing unconfirmed customer accounts
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Ensure products table has condition and specs columns for existing databases
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "condition" text DEFAULT 'Brand New';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "specs" jsonb DEFAULT '[]'::jsonb;


