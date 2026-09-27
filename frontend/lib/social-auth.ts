'use client';

/**
 * Thin wrapper around Google Identity Services ("Sign in with Google"), loaded on demand (no
 * npm packages required). Ends up handing the login page a provider JWT (idToken), which is all
 * `api.loginWithGoogle` needs — verification happens server-side (see GoogleAuthService in the
 * backend).
 *
 * Configuration (public, non-secret client ID only — see .env.example):
 *   NEXT_PUBLIC_GOOGLE_CLIENT_ID
 */

import { useEffect, useState, type RefObject } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
        };
      };
    };
  }
}

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const scriptPromises: Record<string, Promise<void>> = {};

function loadScript(src: string, id: string): Promise<void> {
  if (!scriptPromises[id]) {
    scriptPromises[id] = new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }
  return scriptPromises[id];
}

/**
 * Loads GSI and renders Google's real "Sign in with Google" button, invisibly, into
 * `containerRef`. The caller stacks its own custom-styled button underneath (same size,
 * lower z-index) so the person only ever sees the app's own button, while clicks land on the
 * real Google button — this keeps the OAuth popup a genuine user gesture, which Google (and
 * popup blockers) require, without needing Google's own visual button design.
 */
export function useGoogleSignInOverlay(
  containerRef: RefObject<HTMLDivElement>,
  onCredential: (idToken: string) => void,
  onError: (message: string) => void
) {
  const [ready, setReady] = useState(false);
  const configured = !!GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!configured || !containerRef.current) return;
    let cancelled = false;

    loadScript(GOOGLE_SCRIPT_SRC, 'google-identity-services')
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) onCredential(response.credential);
            else onError('Google sign-in did not return a credential. Please try again.');
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        const width = Math.max(Math.round(containerRef.current.offsetWidth) || 320, 200);
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          width,
        });
        setReady(true);
      })
      .catch(() => onError('Could not load Google sign-in. Check your connection and try again.'));

    return () => {
      cancelled = true;
    };
    // Intentionally run once: the container mounts once and GSI's own button manages its own re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  return { ready, configured };
}
