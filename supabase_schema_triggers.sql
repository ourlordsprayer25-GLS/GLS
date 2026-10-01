-- GLADYNS Supabase Database Triggers & Realtime Setup
-- Run these SQL statements directly in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Ensure RLS is disabled so client writes succeed
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;

-- 2. Trigger Function: Auto-create Notification when Admin adds a New Product
CREATE OR REPLACE FUNCTION notify_on_new_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (id, title, message, timestamp, read, type, link_target)
  VALUES (
    'notif-prod-' || NEW.id || '-' || (EXTRACT(EPOCH FROM NOW())::BIGINT),
    '✨ New Arrival: ' || NEW.name,
    'Discover our newest addition: "' || NEW.name || '" is now available in store for $' || ROUND(NEW.price::numeric, 2) || '.',
    (EXTRACT(EPOCH FROM NOW())::BIGINT * 1000),
    false,
    'product',
    NEW.id
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
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (id, title, message, timestamp, read, type, link_target, customer_id)
    VALUES (
      'notif-status-' || NEW.id || '-' || NEW.status || '-' || (EXTRACT(EPOCH FROM NOW())::BIGINT),
      'Order ' || NEW.order_number || ' Status Updated to ' || UPPER(NEW.status),
      'Your order #' || NEW.order_number || ' has transitioned to ' || NEW.status || '.',
      (EXTRACT(EPOCH FROM NOW())::BIGINT * 1000),
      false,
      'order',
      NEW.order_number,
      NEW.customer_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_status_notif ON public.orders;
CREATE TRIGGER trigger_order_status_notif
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION notify_on_order_status_change();
