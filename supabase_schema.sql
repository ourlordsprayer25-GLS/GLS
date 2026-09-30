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
  "stockLevel" integer DEFAULT 0
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  "id" text PRIMARY KEY,
  "orderNumber" text,
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
  "linkTarget" text
);

-- 5. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  "id" text PRIMARY KEY,
  "config" jsonb DEFAULT '{}'::jsonb,
  "updated_at" timestamp with time zone DEFAULT now()
);

-- 6. REALTIME REPLICATION FIX (Optional but recommended for React Realtime)
-- This ensures Supabase emits changes over websockets to your clients
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
