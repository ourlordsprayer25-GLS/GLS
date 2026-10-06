import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ADMIN_SESSION_KEY = 'gladyns_admin_session';
export const ADMIN_PIN_LOCKED_KEY = 'gladyns_admin_pin_locked';

export interface AdminSession {
  email: string;
  role?: string;
  authenticatedAt: number;
}

// Master default credentials configured in supabase_admin_security.sql
export const DEFAULT_ADMIN_USERNAMES = [
  'gladyns.store',
  'gladyns@store',
  'gladyns',
  'admin',
  'admin@gladyns.com',
  'superadmin',
];
export const DEFAULT_ADMIN_PASSWORD = 'chibuike@256';
export const DEFAULT_ADMIN_PIN = '2005';

const LOCAL_ADMIN_KEY = 'gladyns_admin_custom_creds';

function getCustomAdminCreds(): { email?: string; password?: string; pin?: string } | null {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

/**
 * Validates admin username/email and password against Supabase SQL RPC with graceful master credentials fallback.
 */
export async function verifyAdminCredentials(
  identifier: string,
  rawPass: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = rawPass.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Please enter both administrator email and password.' };
  }

  const custom = getCustomAdminCreds();

  // 1. Direct validation against master admin credentials or locally updated credentials
  const isMasterUsername = DEFAULT_ADMIN_USERNAMES.includes(cleanId) || (custom?.email && custom.email.toLowerCase() === cleanId);
  const isMasterPassword = cleanPass === (custom?.password || DEFAULT_ADMIN_PASSWORD);

  if (isMasterUsername && isMasterPassword) {
    const sessionEmail = cleanId.includes('@') ? cleanId : `${cleanId}@gladyns.com`;
    return {
      success: true,
      email: sessionEmail,
    };
  }

  // 2. Secondary check: Try Supabase RPC if configured
  if (isSupabaseConfigured) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('verify_admin_login', {
        p_email: cleanId,
        p_password: cleanPass,
      });

      if (!rpcError && rpcData && rpcData.success) {
        return {
          success: true,
          email: rpcData.email || cleanId,
        };
      }

      // Supabase Auth fallback
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
    } catch (_) {
      // Supabase offline or unreachable
    }
  }

  return {
    success: false,
    error: 'Invalid administrator email or password.',
  };
}

/**
 * Validates 4-digit PIN against master PIN, custom PIN, and Supabase SQL RPC.
 */
export async function verifyAdminPin(pin: string): Promise<boolean> {
  const cleanPin = pin.trim();
  if (cleanPin.length !== 4) return false;

  const custom = getCustomAdminCreds();
  const isMasterPin = cleanPin === (custom?.pin || DEFAULT_ADMIN_PIN);
  if (isMasterPin) {
    return true;
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('verify_admin_pin', {
        p_pin: cleanPin,
      });
      if (!error && data && data.success === true) {
        return true;
      }
    } catch (_) {}
  }

  return false;
}

/**
 * Rotates or updates admin credentials both locally and in Supabase via secure SQL RPC
 */
export async function updateAdminCredentialsInSql(params: {
  email: string;
  currentPassword: string;
  newPassword?: string;
  newPin?: string;
}): Promise<{ success: boolean; error?: string }> {
  const custom = getCustomAdminCreds();
  const expectedPassword = custom?.password || DEFAULT_ADMIN_PASSWORD;

  if (params.currentPassword.trim() !== expectedPassword) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  // Update locally so it persists across refreshes and offline sessions
  try {
    const updated = {
      email: params.email.trim(),
      password: params.newPassword?.trim() || expectedPassword,
      pin: params.newPin?.trim() || custom?.pin || DEFAULT_ADMIN_PIN,
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(updated));
  } catch (_) {}

  // Sync to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc('update_admin_credentials', {
        p_email: params.email.trim(),
        p_current_password: params.currentPassword.trim(),
        p_new_password: params.newPassword?.trim() || null,
        p_new_pin: params.newPin?.trim() || null,
      });
    } catch (_) {}
  }

  return { success: true };
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
