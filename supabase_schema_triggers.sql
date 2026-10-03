-- GLADYNS Supabase Database Triggers & Realtime Setup
-- Run these SQL statements directly in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Ensure RLS is disabled so client writes succeed
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands DISABLE ROW LEVEL SECURITY;

-- 2. Trigger Function: Auto-create Notification when Admin adds a New Product
CREATE OR REPLACE FUNCTION notify_on_new_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications ("id", "title", "message", "timestamp", "read", "type", "linkTarget", "isAdminOnly")
  VALUES (
    'notif-prod-' || NEW."id" || '-' || (EXTRACT(EPOCH FROM NOW())::BIGINT),
    '✨ New Arrival: ' || COALESCE(NEW."name", 'Product'),
    'Discover our newest addition: "' || COALESCE(NEW."name", 'Product') || '" is now available in store for $' || ROUND(COALESCE(NEW."price", 0)::numeric, 2) || '.',
    (EXTRACT(EPOCH FROM NOW())::BIGINT * 1000),
    false,
    'product',
    NEW."id",
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_product_notif ON public.products;
CREATE TRIGGER trigger_new_product_notif
AFTER INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION notify_on_new_product();

-- 3. Trigger Function: Auto-create Notification when Order Status transitions
CREATE OR REPLACE FUNCTION notify_on_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD."status" IS DISTINCT FROM NEW."status") THEN
    INSERT INTO public.notifications ("id", "title", "message", "timestamp", "read", "type", "linkTarget", "customerId", "isAdminOnly")
    VALUES (
      'notif-status-' || NEW."id" || '-' || NEW."status" || '-' || (EXTRACT(EPOCH FROM NOW())::BIGINT),
      'Order ' || COALESCE(NEW."orderNumber", '') || ' Status Updated to ' || UPPER(NEW."status"),
      'Your order #' || COALESCE(NEW."orderNumber", '') || ' has transitioned to ' || NEW."status" || '.',
      (EXTRACT(EPOCH FROM NOW())::BIGINT * 1000),
      false,
      'order',
      NEW."orderNumber",
      NEW."customerId",
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_status_notif ON public.orders;
CREATE TRIGGER trigger_order_status_notif
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION notify_on_order_status_change();

-- 4. Trigger Function: Auto-sync new Customer Account from auth.users to public.users
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

-- 5. Trigger Function: Auto-confirm user emails so accounts can log in immediately
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

-- 6. Retroactively auto-confirm and sync any existing unconfirmed customer accounts
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;


