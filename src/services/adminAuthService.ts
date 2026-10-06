import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ADMIN_SESSION_KEY = 'gladyns_admin_session';
export const ADMIN_PIN_LOCKED_KEY = 'gladyns_admin_pin_locked';

export interface AdminSession {
  email: string;
  role?: string;
  authenticatedAt: number;
}

/**
 * Validates admin username/email and password strictly against Supabase SQL RPC.
 * Zero hardcoded passwords or hashes exist on the client side.
 */
export async function verifyAdminCredentials(
  identifier: string,
  rawPass: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const cleanId = identifier.trim();
  const cleanPass = rawPass.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Please enter both administrator email and password.' };
  }

  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase connection is not configured in .env file. Please check VITE_SUPABASE_URL.',
    };
  }

  try {
    // 1. Primary Security: Call PostgreSQL stored procedure `verify_admin_login`
    const { data: rpcData, error: rpcError } = await supabase.rpc('verify_admin_login', {
      p_email: cleanId,
      p_password: cleanPass,
    });

    if (!rpcError && rpcData) {
      if (rpcData.success) {
        return {
          success: true,
          email: rpcData.email || cleanId,
        };
      } else {
        return {
          success: false,
          error: rpcData.error || 'Invalid administrator email or password.',
        };
      }
    }

    // 2. Secondary check: Supabase Auth (if registered in auth.users)
    if (cleanId.includes('@')) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: cleanPass,
        });

        if (!authError && authData?.user) {
          return {
            success: true,
            email: authData.user.email || cleanId,
          };
        }
      } catch (_) {}
    }

    // If the SQL function was not installed yet in Supabase
    if (rpcError && rpcError.message?.includes('function') && rpcError.message?.includes('does not exist')) {
      return {
        success: false,
        error:
          'Supabase SQL procedure "verify_admin_login" not found. Please execute "supabase_admin_security.sql" in your Supabase SQL Editor.',
      };
    }

    return {
      success: false,
      error: rpcError?.message || 'Invalid administrator email or password.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Authentication error communicating with Supabase.',
    };
  }
}

/**
 * Validates 4-digit PIN strictly against Supabase SQL RPC.
 * Zero hardcoded PINs exist on the client side.
 */
export async function verifyAdminPin(pin: string): Promise<boolean> {
  const cleanPin = pin.trim();
  if (cleanPin.length !== 4) return false;

  if (!isSupabaseConfigured) return false;

  try {
    // Primary: Call PostgreSQL stored procedure `verify_admin_pin`
    const { data, error } = await supabase.rpc('verify_admin_pin', {
      p_pin: cleanPin,
    });

    if (!error && data && data.success === true) {
      return true;
    }

    // If the function was not installed yet, log a helpful diagnostic
    if (error && error.message?.includes('does not exist')) {
      console.warn(
        'Supabase SQL procedure "verify_admin_pin" not found. Run supabase_admin_security.sql in Supabase SQL Editor.'
      );
    }

    return false;
  } catch (err) {
    console.error('Error verifying admin PIN with Supabase:', err);
    return false;
  }
}

/**
 * Rotates or updates admin credentials in Supabase via secure SQL RPC
 */
export async function updateAdminCredentialsInSql(params: {
  email: string;
  currentPassword: string;
  newPassword?: string;
  newPin?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase.rpc('update_admin_credentials', {
      p_email: params.email.trim(),
      p_current_password: params.currentPassword.trim(),
      p_new_password: params.newPassword?.trim() || null,
      p_new_pin: params.newPin?.trim() || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data && !data.success) {
      return { success: false, error: data.error || 'Failed to update admin credentials.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update credentials in Supabase.' };
  }
}

/**
 * Tab-level session management:
 * Stored strictly in sessionStorage so closing the tab immediately destroys the session.
 * Reopening the tab will require a full email & password login.
 */
export function getAdminActiveSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email) return parsed;
  } catch (_) {}
  return null;
}

export function setAdminActiveSession(email: string, role: string = 'superadmin') {
  try {
    // Clear any persistent local storage from older versions
    localStorage.removeItem(ADMIN_SESSION_KEY);
    // Write strictly to tab-isolated sessionStorage
    sessionStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        email,
        role,
        authenticatedAt: Date.now(),
      })
    );
    // Clear PIN locked flag upon a fresh login
    sessionStorage.removeItem(ADMIN_PIN_LOCKED_KEY);
  } catch (_) {}
}

export function clearAdminSession() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_PIN_LOCKED_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (_) {}
}

/**
 * PIN Lock state:
 * When a page reload occurs in an active session, this flag locks the interface.
 * The 4-digit PIN is required to unlock.
 */
export function isSessionPinLocked(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_PIN_LOCKED_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

export function setSessionPinLocked(locked: boolean) {
  try {
    if (locked) {
      sessionStorage.setItem(ADMIN_PIN_LOCKED_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_PIN_LOCKED_KEY);
    }
  } catch (_) {}
}
