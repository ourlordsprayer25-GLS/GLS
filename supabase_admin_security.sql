-- ============================================================================
-- GLADYNS MAISON - SECURE ADMIN DATABASE SCHEMA & STORED PROCEDURES (SQL)
-- ============================================================================
-- Copy and paste this ENTIRE file into your Supabase SQL Editor and click "RUN".
-- ============================================================================

-- STEP 1: Enable pgcrypto extension for secure bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- STEP 2: Create the admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'superadmin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 3: Enable Row Level Security (RLS)
-- Strictly blocks all direct public reads/writes via REST API.
-- Only the secure stored procedures below can authenticate.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block direct public reads" ON public.admin_users;
CREATE POLICY "Block direct public reads" ON public.admin_users
    FOR SELECT USING (false);

DROP POLICY IF EXISTS "Block direct public writes" ON public.admin_users;
CREATE POLICY "Block direct public writes" ON public.admin_users
    FOR ALL USING (false);

-- STEP 4: Stored Procedures (Functions) for Server-Side Authentication

-- Procedure A: Verify Admin Login (Email + Password)
CREATE OR REPLACE FUNCTION public.verify_admin_login(
    p_email TEXT,
    p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
BEGIN
    IF p_email IS NULL OR TRIM(p_email) = '' OR p_password IS NULL OR TRIM(p_password) = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Please provide both email and password.'
        );
    END IF;

    -- Lookup admin user case-insensitively
    SELECT * INTO v_user
    FROM public.admin_users
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email))
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid administrator email or password.'
        );
    END IF;

    -- Validate password against bcrypt hash
    IF v_user.password_hash = extensions.crypt(TRIM(p_password), v_user.password_hash) THEN
        RETURN jsonb_build_object(
            'success', true,
            'email', v_user.email,
            'role', v_user.role
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid administrator email or password.'
        );
    END IF;
END;
$$;

-- Procedure B: Verify 4-Digit PIN (For Refresh Unlock Screen)
CREATE OR REPLACE FUNCTION public.verify_admin_pin(
    p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match_count INT;
BEGIN
    IF p_pin IS NULL OR LENGTH(TRIM(p_pin)) != 4 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'PIN must be exactly 4 digits.'
        );
    END IF;

    -- Check if 4-digit PIN matches an authorized admin
    SELECT COUNT(*) INTO v_match_count
    FROM public.admin_users
    WHERE pin_code = TRIM(p_pin);

    IF v_match_count > 0 THEN
        RETURN jsonb_build_object('success', true);
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Incorrect 4-digit PIN code.'
        );
    END IF;
END;
$$;

-- Procedure C: Update Admin Credentials (Password / PIN)
CREATE OR REPLACE FUNCTION public.update_admin_credentials(
    p_email TEXT,
    p_current_password TEXT,
    p_new_password TEXT DEFAULT NULL,
    p_new_pin TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_new_hash TEXT;
    v_new_pin TEXT;
BEGIN
    SELECT * INTO v_user
    FROM public.admin_users
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email))
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Admin user not found.');
    END IF;

    -- Verify current password
    IF v_user.password_hash != extensions.crypt(TRIM(p_current_password), v_user.password_hash) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Current password is incorrect.');
    END IF;

    -- Hash new password if supplied
    IF p_new_password IS NOT NULL AND LENGTH(TRIM(p_new_password)) >= 6 THEN
        v_new_hash := extensions.crypt(TRIM(p_new_password), extensions.gen_salt('bf', 8));
    ELSE
        v_new_hash := v_user.password_hash;
    END IF;

    -- Set new PIN if supplied
    IF p_new_pin IS NOT NULL AND LENGTH(TRIM(p_new_pin)) = 4 THEN
        v_new_pin := TRIM(p_new_pin);
    ELSE
        v_new_pin := v_user.pin_code;
    END IF;

    UPDATE public.admin_users
    SET password_hash = v_new_hash,
        pin_code = v_new_pin,
        updated_at = NOW()
    WHERE id = v_user.id;

    RETURN jsonb_build_object('success', true, 'message', 'Credentials updated successfully.');
END;
$$;

-- STEP 5: Grant execute rights to API roles
GRANT EXECUTE ON FUNCTION public.verify_admin_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_credentials(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ============================================================================
-- STEP 6: YOUR ADMIN CREDENTIALS INSERTION
--
-- Email: gladyns@store
-- Password: chibuike@256 (encrypted with bcrypt using gen_salt('bf', 8))
-- PIN: 2005
-- ============================================================================

INSERT INTO public.admin_users (email, password_hash, pin_code, role)
VALUES 
    ('gladyns.store', extensions.crypt('chibuike@256', extensions.gen_salt('bf', 8)), '2005', 'superadmin'),
    ('gladyns@store', extensions.crypt('chibuike@256', extensions.gen_salt('bf', 8)), '2005', 'superadmin')
ON CONFLICT (email) DO UPDATE
SET password_hash = extensions.crypt('chibuike@256', extensions.gen_salt('bf', 8)),
    pin_code = '2005',
    updated_at = NOW();
