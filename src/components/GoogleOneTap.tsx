import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            nonce?: string;
            use_fedcm_for_prompt?: boolean;
            itp_support?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

// Generate raw and SHA-256 hashed nonce according to official Supabase & Google Identity specifications
async function generateNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return { rawNonce: nonce, hashedNonce };
}

export const GoogleOneTap: React.FC = () => {
  const { user, signInWithGoogleIdToken } = useAuth();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // 1. If user is already authenticated or currently on the admin panel, never show Google One Tap
    const isAdminRoute = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.includes('admin')
    );

    const isLocalHost = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    );

    if (user || isAdminRoute || isLocalHost) {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
      return;
    }

    // 2. Fetch Google Client ID from environment variables or direct config
    const googleClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '158639044811-9v9i32dhtruklfbdkijt6j7lh49vtdo7.apps.googleusercontent.com';

    let intervalId: any = null;

    const initGoogleOneTap = async () => {
      if (!window.google?.accounts?.id || hasInitializedRef.current) return;

      try {
        hasInitializedRef.current = true;

        // Generate cryptographic nonce for Supabase
        const { rawNonce, hashedNonce } = await generateNonce();

        const isLocalHost = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'
        );
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

        // Modern Google Identity Services configuration compatible with FedCM and Supabase
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              await signInWithGoogleIdToken(response.credential, rawNonce);
            }
          },
          nonce: hashedNonce,
          use_fedcm_for_prompt: false, // Prevent FedCM localhost rejection and NetworkError
          auto_select: false,
          cancel_on_tap_outside: false,
          context: 'signin',
        });

        // Prompt Google's native One Tap UI (FedCM compliant invocation)
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('Google One Tap initialization error:', err);
      }
    };

    // If script is already loaded, initialize after short tick
    if (window.google?.accounts?.id) {
      const t = setTimeout(initGoogleOneTap, 600);
      return () => clearTimeout(t);
    } else {
      // Wait for script to finish loading from https://accounts.google.com/gsi/client
      intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(intervalId);
          initGoogleOneTap();
        }
      }, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [user, signInWithGoogleIdToken]);

  // Google One Tap renders its official native iframe directly into the document body
  return null;
};
