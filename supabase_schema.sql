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

