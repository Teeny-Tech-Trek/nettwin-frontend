import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth, type GoogleAuthResult } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Google Identity Services is loaded via index.html.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: 'popup' | 'redirect';
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface UseGoogleAuthOptions {
  onSuccess?: (result: GoogleAuthResult) => void;
  onError?: (error: unknown) => void;
  // Container where Google's official button will be rendered. Required.
  buttonContainerRef: React.RefObject<HTMLDivElement | null>;
  // Visual label on Google's button.
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

// Renders Google's official "Continue with Google" button into the provided
// container. We deliberately use renderButton (popup flow) instead of
// prompt() (One Tap) because:
//   - prompt() requires FedCM / third-party cookies and is silently
//     suppressed by modern Chrome ("GSI_LOGGER" warning in the console).
//   - renderButton's popup flow works regardless of cookie policy.
//   - It gives a clean credential callback and never leaves the UI stuck.
//
// `isLoading` reflects the in-flight backend round-trip *after* Google
// returns a credential — closing the popup itself does not put the button
// into a stuck loading state.
export function useGoogleAuth({
  onSuccess,
  onError,
  buttonContainerRef,
  text = 'continue_with',
}: UseGoogleAuthOptions) {
  const { googleAuth } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  // Plain-English explanation of the last failure, surfaced in the UI.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const renderedRef = useRef(false);
  const callbackRef = useRef<(response: { credential?: string }) => void>(
    () => {}
  );

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // Keep the latest callback in a ref so GIS's stable `initialize` reference
  // always invokes the current onSuccess/onError closures.
  callbackRef.current = async (response) => {
    if (!response?.credential) {
      setIsLoading(false);
      toast({
        title: 'Google sign-in cancelled',
        description: 'No credential was returned.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await googleAuth(response.credential);
      onSuccess?.(result);
    } catch (error) {
      // Detect specific backend failures and translate to actionable text.
      // The auth service already toasts a generic message; we add a clearer
      // in-line explanation for the developer (most useful in local dev).
      const apiMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as Error)?.message ||
        '';
      if (/client id mismatch|audience/i.test(apiMessage)) {
        setHasError(true);
        setErrorMessage(
          'Frontend VITE_GOOGLE_CLIENT_ID and backend GOOGLE_CLIENT_ID are different OAuth clients. Set both to the same Web client ID and restart both servers.'
        );
      }
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Initialize GIS when the script is available.
  useEffect(() => {
    if (!clientId) {
      console.warn(
        '[useGoogleAuth] VITE_GOOGLE_CLIENT_ID is not set — Google sign-in is disabled.'
      );
      setHasError(true);
      setErrorMessage(
        'VITE_GOOGLE_CLIENT_ID is missing. Add it to your .env file and restart the dev server.'
      );
      return;
    }

    // NOTE: we no longer try to auto-detect "origin not allowed" from
    // network/console — cross-origin GIS responses are opaque to JS, so any
    // heuristic produced false positives on successful renders. We surface
    // genuine, observable failures only: missing client ID, GIS script load
    // failure, renderButton throw, and the backend's audience-mismatch
    // response in callbackRef.

    let cancelled = false;
    let pollCount = 0;

    const init = () => {
      if (cancelled || initializedRef.current) return;
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => callbackRef.current(response),
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        initializedRef.current = true;
        setIsReady(true);
      } catch (error) {
        console.error('[useGoogleAuth] GIS initialize failed:', error);
        setHasError(true);
      }
    };

    init();
    if (initializedRef.current || hasError) return;

    // GIS script loads `async defer` — poll briefly until it's ready.
    const interval = window.setInterval(() => {
      pollCount += 1;
      init();
      if (initializedRef.current || pollCount > 50) {
        window.clearInterval(interval);
        if (!initializedRef.current) {
          console.error(
            '[useGoogleAuth] Google Identity Services failed to load. Check that <script src="https://accounts.google.com/gsi/client"> is present in index.html and not blocked.'
          );
          setHasError(true);
        }
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [clientId, hasError]);

  // 2. Render Google's button into the host container once GIS is ready.
  useEffect(() => {
    if (!isReady || renderedRef.current) return;
    const host = buttonContainerRef.current;
    if (!host) return;
    if (!window.google?.accounts?.id) return;

    try {
      // GIS clamps width to [200, 400]; pick the container's actual width
      // so the button fills the slot in our themed wrapper.
      const measured = host.offsetWidth || host.clientWidth || 320;
      const width = Math.max(200, Math.min(400, Math.round(measured)));

      window.google.accounts.id.renderButton(host, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text,
        shape: 'pill',
        logo_alignment: 'left',
        width,
      });
      renderedRef.current = true;
    } catch (error) {
      console.error('[useGoogleAuth] renderButton failed:', error);
      setHasError(true);
      setErrorMessage(
        (error as Error)?.message ||
          'Google failed to render the sign-in button. Open DevTools console for details.'
      );
      onError?.(error);
    }
  }, [isReady, buttonContainerRef, text, onError]);

  // Programmatic retry — useful for the page to attempt a manual reset
  // (e.g. when the user clicks a "retry" link after a config error).
  const retry = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    renderedRef.current = false;
    initializedRef.current = false;
    setIsReady(false);
  }, []);

  return { isLoading, isReady, hasError, errorMessage, retry };
}
